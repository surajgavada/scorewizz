"""
ScoreWizz - Python Backend Server
Runs an HTTP server with REST APIs for Tournaments, Points Table, Fixtures,
Live Scoring, Match Archives, and Static PWA File Serving.
"""

import http.server
import socketserver
import json
import os
import urllib.parse
import signal
from pathlib import Path
import database

PORT = int(os.environ.get('PORT', 3000))
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public')

CONTENT_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8'
}

class ScoreWizzHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Keep logs tidy
        print(f"[{self.log_date_time_string()}] {format % args}")

    def send_json(self, status_code, data):
        response_body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Health endpoint
        if path == '/health':
            return self.send_json(200, {'status': 'ok', 'app': 'ScoreWizz', 'version': '2.0.0'})

        # API: Tournaments list
        if path == '/api/tournaments':
            tournaments = database.get_tournaments_list()
            return self.send_json(200, tournaments)

        # API: Get full tournament details (including points table, fixtures, squads, leaders)
        if path.startswith('/api/tournaments/'):
            tournament_id = path.split('/')[-1]
            data = database.get_tournament_full(tournament_id)
            if data:
                return self.send_json(200, data)
            return self.send_json(404, {'error': 'Tournament not found'})

        # Static File Serving
        self.serve_static_file(path)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        # API: Create new tournament with squads and auto/manual schedule
        if path == '/api/tournaments':
            try:
                t_id = database.create_tournament_with_squads(payload)
                full_t = database.get_tournament_full(t_id)
                return self.send_json(201, {'success': True, 'tournament': full_t})
            except Exception as e:
                return self.send_json(500, {'error': str(e)})

        # API: Save match & update tournament standings/player stats
        if path == '/api/matches':
            try:
                tournament_id = payload.get('tournament_id')
                if tournament_id:
                    database.update_points_table_after_match(tournament_id, payload)
                return self.send_json(200, {'success': True, 'message': 'Match saved and points table updated'})
            except Exception as e:
                return self.send_json(500, {'error': str(e)})

        self.send_json(404, {'error': 'Route not found'})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path.startswith('/api/tournaments/'):
            tournament_id = path.split('/')[-1]
            with database.get_db() as conn:
                conn.execute("DELETE FROM tournaments WHERE id = ?", (tournament_id,))
                conn.commit()
            return self.send_json(200, {'success': True, 'message': 'Tournament deleted'})
        self.send_json(404, {'error': 'Route not found'})

    def serve_static_file(self, req_path):
        clean_path = 'index.html' if req_path == '/' else req_path.lstrip('/')
        file_path = os.path.abspath(os.path.join(PUBLIC_DIR, clean_path))

        # Security check: must reside inside PUBLIC_DIR
        if not file_path.startswith(os.path.abspath(PUBLIC_DIR)) or not os.path.exists(file_path) or os.path.isdir(file_path):
            file_path = os.path.join(PUBLIC_DIR, 'index.html')

        ext = os.path.splitext(file_path)[1].lower()
        content_type = CONTENT_TYPES.get(ext, 'application/octet-stream')

        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(content)))
            # Cache control
            if ext in ['.js', '.css', '.html']:
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_json(500, {'error': f"Failed reading file: {str(e)}"})

class ScoreWizzServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


def run_server():
    # Ensure database is ready
    database.init_db()
    database.seed_sample_tournament_if_empty()
    
    server_address = ('', PORT)
    with ScoreWizzServer(server_address, ScoreWizzHandler) as httpd:
        print(f"==================================================")
        print(f"  ScoreWizz Cricket Tournament & Scoreboard Server")
        print(f"  Running at: http://localhost:{PORT}")
        print(f"  Offline-ready with LocalStorage and ServiceWorker")
        print(f"==================================================")

        def stop_server(signum, _frame):
            print(f"\nReceived signal {signum}; shutting down ScoreWizz server.")
            httpd.shutdown()

        signal.signal(signal.SIGINT, stop_server)
        if hasattr(signal, 'SIGTERM'):
            signal.signal(signal.SIGTERM, stop_server)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down ScoreWizz server.")
        finally:
            httpd.server_close()

if __name__ == '__main__':
    run_server()
