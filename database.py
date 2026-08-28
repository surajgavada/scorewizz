"""
ScoreWizz Database & Tournament Engine (SQLite)
Manages tournaments, teams, player squads, tournament fixtures, points table,
matches, full scorecards, ball-by-ball history, and leaderboards.
"""

import sqlite3
import json
import os
import math
from pathlib import Path

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scorewizz.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Tournaments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tournaments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                overs INTEGER NOT NULL DEFAULT 20,
                format TEXT NOT NULL DEFAULT 'T20',
                points_win INTEGER NOT NULL DEFAULT 2,
                points_tie INTEGER NOT NULL DEFAULT 1,
                status TEXT NOT NULL DEFAULT 'active',
                owner TEXT DEFAULT 'Suraj',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Teams table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS teams (
                id TEXT PRIMARY KEY,
                tournament_id TEXT NOT NULL,
                name TEXT NOT NULL,
                short_name TEXT NOT NULL,
                color TEXT NOT NULL DEFAULT '#ed6a4e',
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
            )
        """)
        
        # Players table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS players (
                id TEXT PRIMARY KEY,
                tournament_id TEXT NOT NULL,
                team_id TEXT NOT NULL,
                player_number INTEGER DEFAULT 0,
                name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'Batter', -- Batter, Bowler, All-Rounder, Wicketkeeper
                is_captain INTEGER DEFAULT 0,
                is_vice_captain INTEGER DEFAULT 0,
                batting_style TEXT DEFAULT 'Right-hand bat',
                bowling_style TEXT DEFAULT 'Right-arm medium',
                matches INTEGER DEFAULT 0,
                runs INTEGER DEFAULT 0,
                balls_faced INTEGER DEFAULT 0,
                fours INTEGER DEFAULT 0,
                sixes INTEGER DEFAULT 0,
                high_score INTEGER DEFAULT 0,
                fifties INTEGER DEFAULT 0,
                hundreds INTEGER DEFAULT 0,
                not_outs INTEGER DEFAULT 0,
                overs_bowled REAL DEFAULT 0.0,
                balls_bowled INTEGER DEFAULT 0,
                maidens INTEGER DEFAULT 0,
                runs_conceded INTEGER DEFAULT 0,
                wickets INTEGER DEFAULT 0,
                catches INTEGER DEFAULT 0,
                run_outs INTEGER DEFAULT 0,
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
            )
        """)
        
        # Fixtures / Schedule table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS fixtures (
                id TEXT PRIMARY KEY,
                tournament_id TEXT NOT NULL,
                match_number INTEGER NOT NULL,
                team1_id TEXT NOT NULL,
                team2_id TEXT NOT NULL,
                venue TEXT DEFAULT 'Main Cricket Stadium',
                match_date TEXT DEFAULT 'Today',
                status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, live, completed
                stage TEXT,
                next_fixture_id TEXT,
                next_slot INTEGER,
                winner_team_id TEXT,
                result_text TEXT,
                match_data TEXT, -- JSON blob of full match state
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
            )
        """)
        
        # Points table cache / standings
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS points_table (
                tournament_id TEXT NOT NULL,
                team_id TEXT NOT NULL,
                played INTEGER DEFAULT 0,
                won INTEGER DEFAULT 0,
                lost INTEGER DEFAULT 0,
                tied INTEGER DEFAULT 0,
                no_result INTEGER DEFAULT 0,
                points INTEGER DEFAULT 0,
                runs_scored INTEGER DEFAULT 0,
                overs_faced REAL DEFAULT 0.0,
                balls_faced INTEGER DEFAULT 0,
                runs_conceded INTEGER DEFAULT 0,
                overs_bowled REAL DEFAULT 0.0,
                balls_bowled INTEGER DEFAULT 0,
                net_run_rate REAL DEFAULT 0.0,
                form TEXT DEFAULT '[]', -- JSON array of outcomes ['W', 'L']
                PRIMARY KEY (tournament_id, team_id),
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
            )
        """)
        
        try:
            cursor.execute("ALTER TABLE players ADD COLUMN player_number INTEGER DEFAULT 0")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE fixtures ADD COLUMN stage TEXT")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE fixtures ADD COLUMN next_fixture_id TEXT")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE fixtures ADD COLUMN next_slot INTEGER")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE tournaments ADD COLUMN owner TEXT DEFAULT 'Suraj'")
        except Exception:
            pass
            
        conn.commit()

# Round-robin schedule generator (Berger Algorithm with Multi-Round support)
def generate_round_robin_schedule(teams, tournament_id, rounds_count=1):
    """
    Generates a balanced round-robin league schedule for given teams for specified rounds.
    """
    n = len(teams)
    if n < 2:
        return []
    
    rounds_count = max(1, int(rounds_count))
    team_list = list(teams)
    if n % 2 != 0:
        team_list.append({'id': 'BYE', 'name': 'BYE'})
        n += 1
    
    rounds_per_cycle = n - 1
    matches_per_round = n // 2
    fixtures = []
    match_num = 1
    
    for cycle in range(rounds_count):
        current_teams = list(team_list)
        for r in range(rounds_per_cycle):
            matchday = (cycle * rounds_per_cycle) + r + 1
            for m in range(matches_per_round):
                t1 = current_teams[m]
                t2 = current_teams[n - 1 - m]
                
                # In alternate rounds, invert home/away for fair balance
                if (r + m + cycle) % 2 == 1:
                    t1, t2 = t2, t1
                    
                if t1['id'] != 'BYE' and t2['id'] != 'BYE':
                    leg_label = f" (Leg {cycle + 1})" if rounds_count > 1 else ""
                    fixtures.append({
                        'id': f"fix_{tournament_id}_{match_num}",
                        'tournament_id': tournament_id,
                        'match_number': match_num,
                        'team1_id': t1['id'],
                        'team2_id': t2['id'],
                        'venue': f"Pitch {((match_num - 1) % 3) + 1}, Ground",
                        'match_date': f"Matchday {matchday}{leg_label}",
                        'status': 'upcoming'
                    })
                    match_num += 1
                    
            current_teams = [current_teams[0]] + [current_teams[-1]] + current_teams[1:-1]
        
    return fixtures

def generate_knockout_schedule(teams, tournament_id):
    """
    Generates a universal single-elimination tournament knockout bracket for any number of teams N >= 2,
    with automatic seeding, Byes, progression links (next_fixture_id, next_slot), and stage labels.
    """
    import math
    n = len(teams)
    if n < 2:
        return []
        
    # 1. Determine bracket size (smallest power of 2 >= n)
    k = math.ceil(math.log2(n))
    P = 1 << k
    
    # 2. Standard tournament seeding
    seeds = [0, 1]
    while len(seeds) < P:
        next_seeds = []
        target_sum = len(seeds) * 2 - 1
        for s in seeds:
            next_seeds.append(s)
            next_seeds.append(target_sum - s)
        seeds = next_seeds
        
    # 3. Initial leaves (teams or byes)
    leaves = []
    for s in seeds:
        if s < n:
            leaves.append({'type': 'team', 'team': teams[s], 'seed': s})
        else:
            leaves.append({'type': 'bye', 'seed': s})
            
    round_names = {
        1: "Grand Final",
        2: "Semi-Final",
        3: "Quarter-Final",
        4: "Round of 16",
        5: "Round of 32",
        6: "Round of 64"
    }
    
    current_layer = leaves
    round_num = 1
    total_rounds = k
    all_matches = []
    match_counter = 1
    
    while len(current_layer) > 1:
        next_layer = []
        remaining_rounds = total_rounds - round_num + 1
        stage_name = round_names.get(remaining_rounds, f"Round {round_num}")
        
        for i in range(0, len(current_layer), 2):
            node1 = current_layer[i]
            node2 = current_layer[i+1]
            
            if node1['type'] == 'bye' and node2['type'] == 'bye':
                next_layer.append({'type': 'bye'})
            elif node1['type'] != 'bye' and node2['type'] == 'bye':
                next_layer.append(node1)
            elif node1['type'] == 'bye' and node2['type'] != 'bye':
                next_layer.append(node2)
            else:
                match_id = f"fix_{tournament_id}_{match_counter}"
                match_obj = {
                    'id': match_id,
                    'tournament_id': tournament_id,
                    'match_number': match_counter,
                    'node1': node1,
                    'node2': node2,
                    'stage_round': remaining_rounds,
                    'stage_name': stage_name,
                    'round_index': round_num
                }
                all_matches.append(match_obj)
                match_counter += 1
                next_layer.append({'type': 'match', 'match': match_obj})
                
        current_layer = next_layer
        round_num += 1
        
    all_matches.sort(key=lambda m: (m['round_index'], m['match_number']))
    
    final_fixtures = []
    match_id_map = {}
    for idx, m in enumerate(all_matches):
        new_match_num = idx + 1
        old_id = m['id']
        new_id = f"fix_{tournament_id}_{new_match_num}"
        match_id_map[old_id] = (new_id, new_match_num)
        
    stage_counts = {}
    for m in all_matches:
        sn = m['stage_name']
        stage_counts[sn] = stage_counts.get(sn, 0) + 1
        
    stage_indices = {}
    for idx, m in enumerate(all_matches):
        new_id, new_match_num = match_id_map[m['id']]
        sn = m['stage_name']
        stage_indices[sn] = stage_indices.get(sn, 0) + 1
        
        if stage_counts[sn] > 1:
            stage_display = f"{sn} {stage_indices[sn]}"
        else:
            stage_display = sn
            
        n1 = m['node1']
        n2 = m['node2']
        
        if n1['type'] == 'team':
            t1_id = n1['team']['id']
            t1_name = n1['team']['name']
            t1_short = n1['team'].get('short_name', 'T1')
            t1_color = n1['team'].get('color', '#ed6a4e')
        else:
            prev_new_id, prev_num = match_id_map[n1['match']['id']]
            t1_id = f"TBD_M{prev_num}"
            t1_name = f"TBD (Winner Match #{prev_num})"
            t1_short = "TBD"
            t1_color = "#64748b"
            
        if n2['type'] == 'team':
            t2_id = n2['team']['id']
            t2_name = n2['team']['name']
            t2_short = n2['team'].get('short_name', 'T2')
            t2_color = n2['team'].get('color', '#3b82f6')
        else:
            prev_new_id, prev_num = match_id_map[n2['match']['id']]
            t2_id = f"TBD_M{prev_num}"
            t2_name = f"TBD (Winner Match #{prev_num})"
            t2_short = "TBD"
            t2_color = "#64748b"
            
        fix_dict = {
            'id': new_id,
            'tournament_id': tournament_id,
            'match_number': new_match_num,
            'team1_id': t1_id,
            'team1_name': t1_name,
            'team1_short': t1_short,
            'team1_color': t1_color,
            'team2_id': t2_id,
            'team2_name': t2_name,
            'team2_short': t2_short,
            'team2_color': t2_color,
            'venue': f"Pitch {((new_match_num - 1) % 4) + 1} Arena" if m['stage_round'] > 1 else "Grand Stadium Arena",
            'match_date': stage_display,
            'stage': stage_display,
            'status': 'upcoming',
            'winner_team_id': None,
            'result_text': None
        }
        final_fixtures.append(fix_dict)
        
    for idx, m in enumerate(all_matches):
        for future_m in all_matches:
            if future_m['node1'].get('type') == 'match' and future_m['node1']['match']['id'] == m['id']:
                target_new_id, _ = match_id_map[future_m['id']]
                final_fixtures[idx]['next_fixture_id'] = target_new_id
                final_fixtures[idx]['next_slot'] = 1
                break
            elif future_m['node2'].get('type') == 'match' and future_m['node2']['match']['id'] == m['id']:
                target_new_id, _ = match_id_map[future_m['id']]
                final_fixtures[idx]['next_fixture_id'] = target_new_id
                final_fixtures[idx]['next_slot'] = 2
                break
                
    return final_fixtures

def create_tournament_with_squads(tournament_data):
    """
    Creates a tournament, its teams, player squads, and generates schedule (auto, knockout, or manual).
    """
    import time
    tournament_id = tournament_data.get('id') or f"tour_{int(time.time() * 1000)}"
    name = tournament_data.get('name', 'Premier Cricket Championship')
    overs = int(tournament_data.get('overs', 20))
    format_name = tournament_data.get('format', 'T20')
    owner = tournament_data.get('owner') or tournament_data.get('created_by') or 'Suraj'
    teams_data = tournament_data.get('teams', [])
    schedule_mode = tournament_data.get('schedule_mode', 'auto') # 'auto', 'knockout', or 'manual'
    rounds_count = int(tournament_data.get('rounds_count', 1))
    manual_fixtures = tournament_data.get('manual_fixtures', [])
    
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO tournaments (id, name, overs, format, points_win, points_tie, status, owner)
            VALUES (?, ?, ?, ?, 2, 1, 'active', ?)
        """, (tournament_id, name, overs, format_name, owner))
        
        created_teams = []
        for idx, t in enumerate(teams_data):
            t_id = t.get('id') or f"team_{tournament_id}_{idx+1}"
            t_name = t.get('name', f"Team {idx+1}")
            t_short = t.get('short_name', t_name[:3].upper())
            t_color = t.get('color', ['#ed6a4e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][idx % 6])
            
            cursor.execute("""
                INSERT OR REPLACE INTO teams (id, tournament_id, name, short_name, color)
                VALUES (?, ?, ?, ?, ?)
            """, (t_id, tournament_id, t_name, t_short, t_color))
            
            cursor.execute("""
                INSERT OR REPLACE INTO points_table (tournament_id, team_id, played, won, lost, tied, no_result, points, net_run_rate)
                VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0.0)
            """, (tournament_id, t_id))
            
            players = t.get('players', [])
            for p_idx, p in enumerate(players):
                p_id = p.get('id') or f"p_{t_id}_{p_idx+1}"
                p_name = p.get('name', f"Player {p_idx+1}")
                p_role = p.get('role', 'Batter' if p_idx < 5 else ('All-Rounder' if p_idx < 7 else 'Bowler'))
                if p_idx == 1:
                    p_role = 'Wicketkeeper'
                p_bat = p.get('batting_style', 'Right-hand bat')
                p_bowl = p.get('bowling_style', 'Right-arm medium')
                
                is_cap = 1 if (p.get('is_captain') or '(c)' in p_name.lower()) else 0
                is_vc = 1 if (p.get('is_vice_captain') or '(vc)' in p_name.lower()) else 0
                p_num = int(p.get('player_number', p_idx + 1))

                cursor.execute("""
                    INSERT OR REPLACE INTO players (id, tournament_id, team_id, player_number, name, role, is_captain, is_vice_captain, batting_style, bowling_style)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (p_id, tournament_id, t_id, p_num, p_name, p_role, is_cap, is_vc, p_bat, p_bowl))
                
            created_teams.append({'id': t_id, 'name': t_name, 'short_name': t_short, 'color': t_color})
            
        # Generate fixtures
        if schedule_mode == 'knockout':
            fixtures = generate_knockout_schedule(created_teams, tournament_id)
        elif schedule_mode == 'auto':
            fixtures = generate_round_robin_schedule(created_teams, tournament_id, rounds_count)
        else:
            fixtures = []
            for idx, fix in enumerate(manual_fixtures):
                fix_id = fix.get('id') or f"fix_{tournament_id}_{idx+1}"
                fixtures.append({
                    'id': fix_id,
                    'tournament_id': tournament_id,
                    'match_number': idx + 1,
                    'team1_id': fix.get('team1_id'),
                    'team2_id': fix.get('team2_id'),
                    'venue': fix.get('venue', 'Main Cricket Ground'),
                    'match_date': fix.get('match_date', f"Match {idx+1}"),
                    'status': 'upcoming'
                })
                
        for fix in fixtures:
            cursor.execute("""
                INSERT OR REPLACE INTO fixtures (id, tournament_id, match_number, team1_id, team2_id, venue, match_date, status, stage, next_fixture_id, next_slot)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (fix['id'], tournament_id, fix['match_number'], fix['team1_id'], fix['team2_id'], fix.get('venue', 'Main Cricket Stadium'), fix.get('match_date', f"Match {fix['match_number']}"), fix.get('status', 'upcoming'), fix.get('stage'), fix.get('next_fixture_id'), fix.get('next_slot')))
            
        conn.commit()
        return tournament_id

def get_tournaments_list(owner=None):
    """Returns tournaments, optionally filtered by owner."""
    with get_db() as conn:
        cursor = conn.cursor()
        if owner and str(owner).strip():
            cursor.execute("SELECT * FROM tournaments WHERE LOWER(COALESCE(owner, 'Suraj')) = LOWER(?) ORDER BY created_at DESC", (owner.strip(),))
        else:
            cursor.execute("SELECT * FROM tournaments ORDER BY created_at DESC")
        return [dict(r) for r in cursor.fetchall()]

def delete_tournament(tournament_id, owner=None):
    """Deletes a tournament and its associated records."""
    with get_db() as conn:
        cursor = conn.cursor()
        if owner and str(owner).strip():
            cursor.execute("DELETE FROM matches WHERE tournament_id = ? AND tournament_id IN (SELECT id FROM tournaments WHERE id = ? AND LOWER(COALESCE(owner, 'Suraj')) = LOWER(?))", (tournament_id, tournament_id, owner.strip()))
            cursor.execute("DELETE FROM fixtures WHERE tournament_id = ? AND tournament_id IN (SELECT id FROM tournaments WHERE id = ? AND LOWER(COALESCE(owner, 'Suraj')) = LOWER(?))", (tournament_id, tournament_id, owner.strip()))
            cursor.execute("DELETE FROM points_table WHERE tournament_id = ? AND tournament_id IN (SELECT id FROM tournaments WHERE id = ? AND LOWER(COALESCE(owner, 'Suraj')) = LOWER(?))", (tournament_id, tournament_id, owner.strip()))
            cursor.execute("DELETE FROM players WHERE tournament_id = ? AND tournament_id IN (SELECT id FROM tournaments WHERE id = ? AND LOWER(COALESCE(owner, 'Suraj')) = LOWER(?))", (tournament_id, tournament_id, owner.strip()))
            cursor.execute("DELETE FROM teams WHERE tournament_id = ? AND tournament_id IN (SELECT id FROM tournaments WHERE id = ? AND LOWER(COALESCE(owner, 'Suraj')) = LOWER(?))", (tournament_id, tournament_id, owner.strip()))
            cursor.execute("DELETE FROM tournaments WHERE id = ? AND LOWER(COALESCE(owner, 'Suraj')) = LOWER(?)", (tournament_id, owner.strip()))
        else:
            cursor.execute("DELETE FROM matches WHERE tournament_id = ?", (tournament_id,))
            cursor.execute("DELETE FROM fixtures WHERE tournament_id = ?", (tournament_id,))
            cursor.execute("DELETE FROM points_table WHERE tournament_id = ?", (tournament_id,))
            cursor.execute("DELETE FROM players WHERE tournament_id = ?", (tournament_id,))
            cursor.execute("DELETE FROM teams WHERE tournament_id = ?", (tournament_id,))
            cursor.execute("DELETE FROM tournaments WHERE id = ?", (tournament_id,))
        conn.commit()
        return True

def get_tournament_full(tournament_id):
    """
    Returns complete tournament object with teams, players, points table, fixtures, and leaderboards.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM tournaments WHERE id = ?", (tournament_id,))
        tournament = cursor.fetchone()
        if not tournament:
            return None
        t_dict = dict(tournament)
        
        # Teams
        cursor.execute("SELECT * FROM teams WHERE tournament_id = ?", (tournament_id,))
        teams = [dict(r) for r in cursor.fetchall()]
        
        # Players per team
        for team in teams:
            cursor.execute("SELECT * FROM players WHERE team_id = ? ORDER BY id", (team['id'],))
            team['players'] = [dict(r) for r in cursor.fetchall()]
        t_dict['teams'] = teams
        
        # Fixtures
        cursor.execute("""
            SELECT f.*, 
                   COALESCE(t1.name, f.team1_id) as team1_name, 
                   COALESCE(t1.short_name, 'TBD') as team1_short, 
                   COALESCE(t1.color, '#64748b') as team1_color,
                   COALESCE(t2.name, f.team2_id) as team2_name, 
                   COALESCE(t2.short_name, 'TBD') as team2_short, 
                   COALESCE(t2.color, '#64748b') as team2_color
            FROM fixtures f
            LEFT JOIN teams t1 ON f.team1_id = t1.id
            LEFT JOIN teams t2 ON f.team2_id = t2.id
            WHERE f.tournament_id = ?
            ORDER BY f.match_number ASC
        """, (tournament_id,))
        t_dict['fixtures'] = [dict(r) for r in cursor.fetchall()]
        
        # Points Table
        cursor.execute("""
            SELECT pt.*, t.name as team_name, t.short_name, t.color
            FROM points_table pt
            JOIN teams t ON pt.team_id = t.id
            WHERE pt.tournament_id = ?
            ORDER BY pt.points DESC, pt.net_run_rate DESC, pt.won DESC
        """, (tournament_id,))
        raw_pt = [dict(r) for r in cursor.fetchall()]
        for r in raw_pt:
            if isinstance(r.get('form'), str):
                try:
                    r['form'] = json.loads(r['form'])
                except:
                    r['form'] = []
        t_dict['points_table'] = raw_pt
        
        # Leaderboards (Orange Cap, Purple Cap, MOTS, Strike Rate, Economy)
        cursor.execute("""
            SELECT p.*, t.name as team_name, t.short_name as team_short, t.color as team_color
            FROM players p
            JOIN teams t ON p.team_id = t.id
            WHERE p.tournament_id = ?
            ORDER BY p.runs DESC, (CAST(p.runs AS REAL) / MAX(1, p.balls_faced)) DESC
            LIMIT 5
        """, (tournament_id,))
        t_dict['orange_cap'] = [dict(r) for r in cursor.fetchall()]
        
        cursor.execute("""
            SELECT p.*, t.name as team_name, t.short_name as team_short, t.color as team_color
            FROM players p
            JOIN teams t ON p.team_id = t.id
            WHERE p.tournament_id = ?
            ORDER BY p.wickets DESC, (CAST(p.runs_conceded AS REAL) / MAX(1, p.balls_bowled / 6.0)) ASC
            LIMIT 5
        """, (tournament_id,))
        t_dict['purple_cap'] = [dict(r) for r in cursor.fetchall()]

        # Most Sixes (6s)
        cursor.execute("""
            SELECT p.*, t.name as team_name, t.short_name as team_short, t.color as team_color
            FROM players p
            JOIN teams t ON p.team_id = t.id
            WHERE p.tournament_id = ?
            ORDER BY p.sixes DESC, p.runs DESC
            LIMIT 5
        """, (tournament_id,))
        t_dict['most_sixes'] = [dict(r) for r in cursor.fetchall()]

        # Most Fours (4s)
        cursor.execute("""
            SELECT p.*, t.name as team_name, t.short_name as team_short, t.color as team_color
            FROM players p
            JOIN teams t ON p.team_id = t.id
            WHERE p.tournament_id = ?
            ORDER BY p.fours DESC, p.runs DESC
            LIMIT 5
        """, (tournament_id,))
        t_dict['most_fours'] = [dict(r) for r in cursor.fetchall()]

        # Best Batting Strike Rate (min 1 ball faced)
        cursor.execute("""
            SELECT p.*, t.name as team_name, t.short_name as team_short, t.color as team_color,
                   ROUND((CAST(p.runs AS REAL) * 100.0 / MAX(1, p.balls_faced)), 1) as strike_rate
            FROM players p
            JOIN teams t ON p.team_id = t.id
            WHERE p.tournament_id = ? AND p.balls_faced > 0
            ORDER BY strike_rate DESC, p.runs DESC
            LIMIT 5
        """, (tournament_id,))
        t_dict['best_strike_rate'] = [dict(r) for r in cursor.fetchall()]

        # Best Bowling Economy (min 6 balls / 1 over bowled)
        cursor.execute("""
            SELECT p.*, t.name as team_name, t.short_name as team_short, t.color as team_color,
                   ROUND((CAST(p.runs_conceded AS REAL) / (p.balls_bowled / 6.0)), 2) as economy_rate
            FROM players p
            JOIN teams t ON p.team_id = t.id
            WHERE p.tournament_id = ? AND p.balls_bowled >= 6
            ORDER BY economy_rate ASC, p.wickets DESC
            LIMIT 5
        """, (tournament_id,))
        t_dict['best_bowling_economy'] = [dict(r) for r in cursor.fetchall()]

        # Man of the Series / Tournament MVP (Impact score = Runs * 1.0 + Wickets * 25 + SR bonus + Econ bonus)
        cursor.execute("""
            SELECT p.*, t.name as team_name, t.short_name as team_short, t.color as team_color,
                   ROUND(p.runs * 1.0 + p.wickets * 25.0, 0) as impact_points
            FROM players p
            JOIN teams t ON p.team_id = t.id
            WHERE p.tournament_id = ?
            ORDER BY impact_points DESC, p.runs DESC, p.wickets DESC
            LIMIT 5
        """, (tournament_id,))
        t_dict['man_of_the_series'] = [dict(r) for r in cursor.fetchall()]
        
        return t_dict

def update_points_table_after_match(tournament_id, match_data):
    """
    Updates the points table and player tournament statistics after a match is concluded.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        team1_id = match_data.get('team1_id')
        team2_id = match_data.get('team2_id')
        winner_id = match_data.get('winner_id')
        is_tie = match_data.get('is_tie', False)
        
        # Innings details
        inn1 = match_data.get('innings1', {})
        inn2 = match_data.get('innings2', {})
        
        batting_team1 = inn1.get('batting_team_id')
        runs1 = int(inn1.get('total_runs', 0))
        balls1 = int(inn1.get('total_legal_balls', 0))
        
        batting_team2 = inn2.get('batting_team_id')
        runs2 = int(inn2.get('total_runs', 0))
        balls2 = int(inn2.get('total_legal_balls', 0))
        
        for team_id in [team1_id, team2_id]:
            if not team_id:
                continue
            cursor.execute("SELECT * FROM points_table WHERE tournament_id = ? AND team_id = ?", (tournament_id, team_id))
            row = cursor.fetchone()
            if not row:
                continue
            
            played = row['played'] + 1
            won = row['won']
            lost = row['lost']
            tied = row['tied']
            points = row['points']
            
            form = []
            try:
                form = json.loads(row['form']) if row['form'] else []
            except:
                form = []
                
            if is_tie:
                tied += 1
                points += 1
                form.append('T')
            elif winner_id == team_id:
                won += 1
                points += 2
                form.append('W')
            else:
                lost += 1
                form.append('L')
                
            if len(form) > 5:
                form = form[-5:]
                
            team_runs_scored = row['runs_scored']
            team_balls_faced = row['balls_faced']
            team_runs_conceded = row['runs_conceded']
            team_balls_bowled = row['balls_bowled']
            
            if team_id == batting_team1:
                team_runs_scored += runs1
                team_balls_faced += balls1
                team_runs_conceded += runs2
                team_balls_bowled += balls2
            else:
                team_runs_scored += runs2
                team_balls_faced += balls2
                team_runs_conceded += runs1
                team_balls_bowled += balls1
                
            overs_faced_val = (team_balls_faced // 6) + ((team_balls_faced % 6) / 6.0)
            overs_bowled_val = (team_balls_bowled // 6) + ((team_balls_bowled % 6) / 6.0)
            
            rr_for = (team_runs_scored / overs_faced_val) if overs_faced_val > 0 else 0.0
            rr_against = (team_runs_conceded / overs_bowled_val) if overs_bowled_val > 0 else 0.0
            nrr = round(rr_for - rr_against, 3)
            
            cursor.execute("""
                UPDATE points_table
                SET played = ?, won = ?, lost = ?, tied = ?, points = ?,
                    runs_scored = ?, balls_faced = ?, runs_conceded = ?, balls_bowled = ?,
                    net_run_rate = ?, form = ?
                WHERE tournament_id = ? AND team_id = ?
            """, (played, won, lost, tied, points, team_runs_scored, team_balls_faced,
                  team_runs_conceded, team_balls_bowled, nrr, json.dumps(form), tournament_id, team_id))
        
        # Update player tournament career stats
        for inn in [inn1, inn2]:
            batters = inn.get('batters', [])
            for b in batters:
                p_id = b.get('player_id')
                if not p_id:
                    continue
                r = int(b.get('runs', 0))
                bf = int(b.get('balls', 0))
                fours = int(b.get('fours', 0))
                sixes = int(b.get('sixes', 0))
                is_out = b.get('is_out', False)
                
                cursor.execute("SELECT * FROM players WHERE id = ?", (p_id,))
                p_row = cursor.fetchone()
                if p_row:
                    new_runs = p_row['runs'] + r
                    new_bf = p_row['balls_faced'] + bf
                    new_fours = p_row['fours'] + fours
                    new_sixes = p_row['sixes'] + sixes
                    new_hs = max(p_row['high_score'], r)
                    new_50s = p_row['fifties'] + (1 if 50 <= r < 100 else 0)
                    new_100s = p_row['hundreds'] + (1 if r >= 100 else 0)
                    new_not_outs = p_row['not_outs'] + (0 if is_out else 1)
                    new_matches = p_row['matches'] + 1
                    
                    cursor.execute("""
                        UPDATE players
                        SET matches = ?, runs = ?, balls_faced = ?, fours = ?, sixes = ?,
                            high_score = ?, fifties = ?, hundreds = ?, not_outs = ?
                        WHERE id = ?
                    """, (new_matches, new_runs, new_bf, new_fours, new_sixes, new_hs, new_50s, new_100s, new_not_outs, p_id))
                    
            bowlers = inn.get('bowlers', [])
            for bw in bowlers:
                p_id = bw.get('player_id')
                if not p_id:
                    continue
                balls = int(bw.get('legal_balls', 0))
                maidens = int(bw.get('maidens', 0))
                runs_conc = int(bw.get('runs', 0))
                wkts = int(bw.get('wickets', 0))
                
                cursor.execute("SELECT * FROM players WHERE id = ?", (p_id,))
                p_row = cursor.fetchone()
                if p_row:
                    new_balls_bowled = p_row['balls_bowled'] + balls
                    new_maidens = p_row['maidens'] + maidens
                    new_runs_conc = p_row['runs_conceded'] + runs_conc
                    new_wkts = p_row['wickets'] + wkts
                    
                    cursor.execute("""
                        UPDATE players
                        SET balls_bowled = ?, maidens = ?, runs_conceded = ?, wickets = ?
                        WHERE id = ?
                    """, (new_balls_bowled, new_maidens, new_runs_conc, new_wkts, p_id))

        # Update fixture status if match linked to fixture
        fixture_id = match_data.get('fixture_id')
        if fixture_id:
            cursor.execute("""
                UPDATE fixtures
                SET status = 'completed', winner_team_id = ?, result_text = ?, match_data = ?
                WHERE id = ?
            """, (winner_id, match_data.get('result_text', ''), json.dumps(match_data), fixture_id))
            
        conn.commit()

def seed_sample_tournament_if_empty():
    """
    Seeds a default rich 4-team T20 Tournament if the DB is empty.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM tournaments")
        if cursor.fetchone()['cnt'] > 0:
            return
            
    sample_tournament = {
        'id': 'tour_premier_2026',
        'name': 'Premier T20 Championship 2026',
        'overs': 20,
        'format': 'T20',
        'schedule_mode': 'auto',
        'teams': [
            {
                'id': 'team_riverside',
                'name': 'Riverside Strikers',
                'short_name': 'RVS',
                'color': '#ed6a4e',
                'players': [
                    {'name': 'Arjun Mehta (c)', 'role': 'Batter'},
                    {'name': 'Rohan Kapoor (wk)', 'role': 'Wicketkeeper'},
                    {'name': 'Vikram Rathore', 'role': 'Batter'},
                    {'name': 'Aditya Sen', 'role': 'All-Rounder'},
                    {'name': 'Karan Verma', 'role': 'All-Rounder'},
                    {'name': 'Samar Joshi', 'role': 'Batter'},
                    {'name': 'Dev Malhotra', 'role': 'Bowler'},
                    {'name': 'Varun Saxena', 'role': 'Bowler'},
                    {'name': 'Pritam Ghosh', 'role': 'Bowler'},
                    {'name': 'Zayan Khan', 'role': 'Bowler'},
                    {'name': 'Neil Bhatt', 'role': 'Bowler'}
                ]
            },
            {
                'id': 'team_northstars',
                'name': 'North Stars Cricket Club',
                'short_name': 'NST',
                'color': '#3b82f6',
                'players': [
                    {'name': 'Marcus Vance (c)', 'role': 'Batter'},
                    {'name': 'Alex Campbell (wk)', 'role': 'Wicketkeeper'},
                    {'name': 'Liam Davies', 'role': 'Batter'},
                    {'name': 'David Ross', 'role': 'All-Rounder'},
                    {'name': 'Chris Evans', 'role': 'All-Rounder'},
                    {'name': 'Harry Walker', 'role': 'Batter'},
                    {'name': 'Ben Mitchell', 'role': 'Bowler'},
                    {'name': 'Oliver Wright', 'role': 'Bowler'},
                    {'name': 'James Miller', 'role': 'Bowler'},
                    {'name': 'Ryan Scott', 'role': 'Bowler'},
                    {'name': 'Luke Harris', 'role': 'Bowler'}
                ]
            },
            {
                'id': 'team_royals',
                'name': 'Royal Challengers City',
                'short_name': 'RCC',
                'color': '#10b981',
                'players': [
                    {'name': 'Kabir Sharma (c)', 'role': 'Batter'},
                    {'name': 'Ishaan Roy (wk)', 'role': 'Wicketkeeper'},
                    {'name': 'Tanmay Deshmukh', 'role': 'Batter'},
                    {'name': 'Sameer Patel', 'role': 'All-Rounder'},
                    {'name': 'Mayank Agarwal', 'role': 'Batter'},
                    {'name': 'Aman Gupta', 'role': 'All-Rounder'},
                    {'name': 'Siddharth Nair', 'role': 'Bowler'},
                    {'name': 'Raghav Menon', 'role': 'Bowler'},
                    {'name': 'Gautam Rao', 'role': 'Bowler'},
                    {'name': 'Farhan Qureshi', 'role': 'Bowler'},
                    {'name': 'Harshvardhan Singh', 'role': 'Bowler'}
                ]
            },
            {
                'id': 'team_thunderbolts',
                'name': 'Thunderbolts XI',
                'short_name': 'TBX',
                'color': '#f59e0b',
                'players': [
                    {'name': 'Rashid Al-Mansoor (c)', 'role': 'All-Rounder'},
                    {'name': 'Tariq Aziz (wk)', 'role': 'Wicketkeeper'},
                    {'name': 'Bilal Ahmed', 'role': 'Batter'},
                    {'name': 'Usman Qazi', 'role': 'Batter'},
                    {'name': 'Imran Sheikh', 'role': 'All-Rounder'},
                    {'name': 'Hamza Baig', 'role': 'Batter'},
                    {'name': 'Shahid Afridi Jr', 'role': 'Bowler'},
                    {'name': 'Waqar Younis Jr', 'role': 'Bowler'},
                    {'name': 'Nasir Khan', 'role': 'Bowler'},
                    {'name': 'Saeed Anwar Jr', 'role': 'Bowler'},
                    {'name': 'Zubair Ali', 'role': 'Bowler'}
                ]
            }
        ]
    }
    create_tournament_with_squads(sample_tournament)

# Initialize on module import
init_db()
seed_sample_tournament_if_empty()
