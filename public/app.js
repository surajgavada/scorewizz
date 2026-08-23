/**
 * ScoreWizz - Cricket Tournament & Live Scoreboard Engine
 * 100% Offline Capable with LocalStorage and Python REST API Sync
 * Supports 11 to 15 player squads per team with Captain (C) & Vice-Captain (VC) selection,
 * in-tournament Squad Editor, and Step-by-Step Wizard.
 */

// Application State
const appState = {
  tournament: null,
  activeMatch: null,
  currentView: 'scoreboard',
  wizardStep: 1,
  activeWizardTeamIndex: 0,
  editingTeamId: null,
  editingTeamSquad: [],
  wizardData: {
    name: 'Premier T20 Championship 2026',
    overs: 20,
    numTeams: 4,
    teams: [],
    scheduleType: 'auto',
    manualFixtures: []
  },
  selectedTeamTabId: null
};

// 15-player rich squad defaults per team
const DEFAULT_SAMPLE_TEAMS = [
  {
    id: 'team_1',
    name: 'Riverside Strikers',
    short_name: 'RVS',
    color: '#ed6a4e',
    players: [
      { id: 'p_t1_1', player_number: 18, name: 'Arjun Mehta', role: 'Batter', is_captain: true, is_vice_captain: false },
      { id: 'p_t1_2', player_number: 7, name: 'Rohan Kapoor', role: 'Wicketkeeper', is_captain: false, is_vice_captain: true },
      { id: 'p_t1_3', player_number: 45, name: 'Vikram Rathore', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_4', player_number: 33, name: 'Aditya Sen', role: 'All-Rounder', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_5', player_number: 12, name: 'Karan Verma', role: 'All-Rounder', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_6', player_number: 9, name: 'Samar Joshi', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_7', player_number: 99, name: 'Dev Malhotra', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_8', player_number: 24, name: 'Varun Saxena', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_9', player_number: 8, name: 'Pritam Ghosh', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_10', player_number: 11, name: 'Zayan Khan', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_11', player_number: 19, name: 'Neil Bhatt', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_12', player_number: 22, name: 'Mihir Das', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_13', player_number: 77, name: 'Chirag Shinde', role: 'All-Rounder', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_14', player_number: 5, name: 'Ashwin Nair', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t1_15', player_number: 15, name: 'Tushar Kadam', role: 'Bowler', is_captain: false, is_vice_captain: false }
    ]
  },
  {
    id: 'team_2',
    name: 'North Stars Cricket Club',
    short_name: 'NST',
    color: '#3b82f6',
    players: [
      { id: 'p_t2_1', player_number: 10, name: 'Marcus Vance', role: 'Batter', is_captain: true, is_vice_captain: false },
      { id: 'p_t2_2', player_number: 17, name: 'Alex Campbell', role: 'Wicketkeeper', is_captain: false, is_vice_captain: true },
      { id: 'p_t2_3', player_number: 3, name: 'Liam Davies', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_4', player_number: 6, name: 'David Ross', role: 'All-Rounder', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_5', player_number: 25, name: 'Chris Evans', role: 'All-Rounder', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_6', player_number: 14, name: 'Harry Walker', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_7', player_number: 55, name: 'Ben Mitchell', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_8', player_number: 88, name: 'Oliver Wright', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_9', player_number: 21, name: 'James Miller', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_10', player_number: 4, name: 'Ryan Scott', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_11', player_number: 13, name: 'Luke Harris', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_12', player_number: 29, name: 'Connor Murphy', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_13', player_number: 31, name: 'Ethan Taylor', role: 'All-Rounder', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_14', player_number: 44, name: 'George Kelly', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t2_15', player_number: 91, name: 'Aaron Ward', role: 'Bowler', is_captain: false, is_vice_captain: false }
    ]
  },
  {
    id: 'team_3',
    name: 'Royal Challengers City',
    short_name: 'RCC',
    color: '#10b981',
    players: [
      { id: 'p_t3_1', player_number: 1, name: 'Kabir Sharma', role: 'Batter', is_captain: true, is_vice_captain: false },
      { id: 'p_t3_2', player_number: 2, name: 'Ishaan Roy', role: 'Wicketkeeper', is_captain: false, is_vice_captain: true },
      { id: 'p_t3_3', player_number: 3, name: 'Tanmay Deshmukh', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_4', player_number: 4, name: 'Sameer Patel', role: 'All-Rounder', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_5', player_number: 5, name: 'Mayank Agarwal', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_6', player_number: 6, name: 'Aman Gupta', role: 'All-Rounder', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_7', player_number: 7, name: 'Siddharth Nair', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_8', player_number: 8, name: 'Raghav Menon', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_9', player_number: 9, name: 'Gautam Rao', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_10', player_number: 10, name: 'Farhan Qureshi', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_11', player_number: 11, name: 'Harshvardhan Singh', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_12', player_number: 12, name: 'Kushagra Soni', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_13', player_number: 13, name: 'Abhay Chauhan', role: 'All-Rounder', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_14', player_number: 14, name: 'Navin Reddy', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t3_15', player_number: 15, name: 'Yash Vardhan', role: 'Bowler', is_captain: false, is_vice_captain: false }
    ]
  },
  {
    id: 'team_4',
    name: 'Thunderbolts XI',
    short_name: 'TBX',
    color: '#f59e0b',
    players: [
      { id: 'p_t4_1', player_number: 10, name: 'Rashid Al-Mansoor', role: 'All-Rounder', is_captain: true, is_vice_captain: false },
      { id: 'p_t4_2', player_number: 16, name: 'Tariq Aziz', role: 'Wicketkeeper', is_captain: false, is_vice_captain: true },
      { id: 'p_t4_3', player_number: 19, name: 'Bilal Ahmed', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_4', player_number: 21, name: 'Usman Qazi', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_5', player_number: 27, name: 'Imran Sheikh', role: 'All-Rounder', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_6', player_number: 30, name: 'Hamza Baig', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_7', player_number: 35, name: 'Shahid Afridi Jr', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_8', player_number: 40, name: 'Waqar Younis Jr', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_9', player_number: 47, name: 'Nasir Khan', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_10', player_number: 52, name: 'Saeed Anwar Jr', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_11', player_number: 58, name: 'Zubair Ali', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_12', player_number: 63, name: 'Fawad Alam Jr', role: 'Batter', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_13', player_number: 72, name: 'Shoaib Akhtar Jr', role: 'Bowler', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_14', player_number: 84, name: 'Asad Shafiq Jr', role: 'All-Rounder', is_captain: false, is_vice_captain: false },
      { id: 'p_t4_15', player_number: 99, name: 'Yasir Shah Jr', role: 'Bowler', is_captain: false, is_vice_captain: false }
    ]
  }
];

// Helper to format player name with (C) and (VC) badges and Jersey Number
function formatPlayerName(player) {
  if (!player) return 'Player';
  const numHtml = player.player_number ? `<span class="player-num-pill">#${player.player_number}</span>` : '';
  let badgeHtml = '';
  if (player.is_captain) badgeHtml += '<span class="badge-captain" title="Team Captain">C</span>';
  if (player.is_vice_captain) badgeHtml += '<span class="badge-vice-captain" title="Vice-Captain">VC</span>';
  return `${numHtml} ${player.name} ${badgeHtml}`.trim();
}

function getPlayerNamePlainText(player) {
  if (!player) return 'Player';
  let prefix = player.player_number ? `#${player.player_number} ` : '';
  let suffix = '';
  if (player.is_captain) suffix += ' (c)';
  if (player.is_vice_captain) suffix += ' (vc)';
  return `${prefix}${player.name}${suffix}`;
}

// ----------------------------------------------------
// STORAGE & API HELPERS
// ----------------------------------------------------

let _saveTournamentDebounceTimer = null;
function saveToLocalStorage(immediateTournament = false) {
  try {
    if (appState.activeMatch) {
      localStorage.setItem('scorewizz_active_match_v4', JSON.stringify(appState.activeMatch));
    }
    if (appState.tournament) {
      saveTournamentToDirectory(appState.tournament);
      if (immediateTournament) {
        clearTimeout(_saveTournamentDebounceTimer);
        localStorage.setItem('scorewizz_tournament_v4', JSON.stringify(appState.tournament));
      } else {
        clearTimeout(_saveTournamentDebounceTimer);
        _saveTournamentDebounceTimer = setTimeout(() => {
          try {
            if (appState.tournament) {
              localStorage.setItem('scorewizz_tournament_v4', JSON.stringify(appState.tournament));
            }
          } catch (e) {}
        }, 400);
      }
    }
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

function loadFromLocalStorage() {
  try {
    const savedT = localStorage.getItem('scorewizz_tournament_v4') || localStorage.getItem('scorewizz_tournament_v3') || localStorage.getItem('scorewizz_tournament_v2');
    const savedM = localStorage.getItem('scorewizz_active_match_v4') || localStorage.getItem('scorewizz_active_match_v3');
    if (savedT) appState.tournament = JSON.parse(savedT);
    if (savedM) appState.activeMatch = JSON.parse(savedM);

    // Auto-repair players without player_number
    if (appState.tournament && appState.tournament.teams) {
      appState.tournament.teams.forEach((t) => {
        if (t.players) {
          t.players.forEach((p, idx) => {
            if (!p.player_number) p.player_number = idx + 1;
          });
        }
      });
    }
  } catch (e) {
    console.error('LocalStorage load error:', e);
  }
}

async function apiFetch(endpoint, method = 'GET', data = null) {
  if (!window.location.protocol.startsWith('http')) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    };
    if (data && method !== 'GET') options.body = JSON.stringify(data);
    const res = await fetch(endpoint, options);
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  loadFromLocalStorage();

  try {
    const serverTournaments = await apiFetch('/api/tournaments');
    if (serverTournaments && serverTournaments.length > 0) {
      const activeTId = appState.tournament?.id || serverTournaments[0].id;
      const fullT = await apiFetch(`/api/tournaments/${activeTId}`);
      if (fullT && fullT.teams && fullT.teams.length >= 2) {
        appState.tournament = fullT;
        saveToLocalStorage();
      }
    }
  } catch (e) {
    console.log('Offline mode active');
  }

  if (!appState.tournament || !appState.tournament.teams || appState.tournament.teams.length < 2) {
    createDefaultTournament();
  }

  ensureValidActiveMatch();
  setupEventListeners();
  renderAllViews();
});

function ensureValidActiveMatch() {
  const tour = appState.tournament;
  if (!tour || !tour.teams || tour.teams.length < 2) {
    createDefaultTournament();
  }

  const t1 = tour.teams[0];
  const t2 = tour.teams[1];

  const m = appState.activeMatch;
  const matchValid = m && m.team1 && m.team2 && 
    m.innings1 && m.innings2 && 
    m.innings1.batters && m.innings1.batters.length > 0 && 
    m.innings1.bowlers && m.innings1.bowlers.length > 0 &&
    tour.teams.some((t) => t.id === m.team1.id) &&
    tour.teams.some((t) => t.id === m.team2.id);

  if (!matchValid) {
    appState.activeMatch = createNewMatchState(t1, t2, tour.overs || 20, tour.fixtures?.[0]?.id || null);
    saveToLocalStorage();
  }
}

function createDefaultTournament() {
  const tId = 'tour_premier_2026';
  const teams = DEFAULT_SAMPLE_TEAMS.map((t, idx) => {
    const teamId = `team_${idx + 1}`;
    return {
      id: teamId,
      tournament_id: tId,
      name: t.name,
      short_name: t.short_name,
      color: t.color,
      players: t.players.map((p, pIdx) => ({
        id: `p_${teamId}_${pIdx + 1}`,
        tournament_id: tId,
        team_id: teamId,
        player_number: p.player_number || (pIdx + 1),
        name: p.name,
        role: p.role,
        is_captain: Boolean(p.is_captain),
        is_vice_captain: Boolean(p.is_vice_captain),
        runs: 0,
        balls_faced: 0,
        fours: 0,
        sixes: 0,
        high_score: 0,
        wickets: 0,
        balls_bowled: 0,
        maidens: 0,
        runs_conceded: 0,
        matches: 0
      }))
    };
  });

  const fixtures = generateRoundRobinSchedule(teams, tId);

  const pointsTable = teams.map((team) => ({
    tournament_id: tId,
    team_id: team.id,
    team_name: team.name,
    short_name: team.short_name,
    color: team.color,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    no_result: 0,
    points: 0,
    runs_scored: 0,
    balls_faced: 0,
    runs_conceded: 0,
    balls_bowled: 0,
    net_run_rate: 0.0,
    form: []
  }));

  appState.tournament = {
    id: tId,
    name: 'Premier T20 Championship 2026',
    overs: 20,
    format: 'T20',
    teams,
    fixtures,
    points_table: pointsTable,
    orange_cap: [],
    purple_cap: []
  };

  appState.activeMatch = createNewMatchState(teams[0], teams[1], 20, fixtures[0]?.id);
  saveToLocalStorage();
}

function generateRoundRobinSchedule(teams, tournamentId, roundsCount = 1) {
  const n = teams.length;
  if (n < 2) return [];

  const cycles = Math.max(1, Number(roundsCount) || 1);
  let list = [...teams];
  if (n % 2 !== 0) {
    list.push({ id: 'BYE', name: 'BYE', short_name: 'BYE' });
  }
  const count = list.length;
  const roundsPerCycle = count - 1;
  const matchesPerRound = count / 2;
  const fixtures = [];
  let matchNum = 1;

  for (let cycle = 0; cycle < cycles; cycle++) {
    let currentList = [...list];
    for (let r = 0; r < roundsPerCycle; r++) {
      const matchday = (cycle * roundsPerCycle) + r + 1;
      for (let m = 0; m < matchesPerRound; m++) {
        let t1 = currentList[m];
        let t2 = currentList[count - 1 - m];

        // In alternate rounds, invert home and away for fair balance
        if ((r + m + cycle) % 2 === 1) {
          [t1, t2] = [t2, t1];
        }

        if (t1.id !== 'BYE' && t2.id !== 'BYE') {
          const legLabel = cycles > 1 ? ` (Leg ${cycle + 1})` : '';
          fixtures.push({
            id: `fix_${tournamentId}_${matchNum}`,
            tournament_id: tournamentId,
            match_number: matchNum,
            team1_id: t1.id,
            team1_name: t1.name,
            team1_short: t1.short_name,
            team1_color: t1.color,
            team2_id: t2.id,
            team2_name: t2.name,
            team2_short: t2.short_name,
            team2_color: t2.color,
            venue: `Ground Pitch ${((matchNum - 1) % 3) + 1}`,
            match_date: `Matchday ${matchday}${legLabel}`,
            status: 'upcoming',
            winner_team_id: null,
            result_text: null
          });
          matchNum++;
        }
      }
      currentList = [currentList[0], currentList[count - 1], ...currentList.slice(1, count - 1)];
    }
  }

  return fixtures;
}

function generateKnockoutSchedule(teams, tournamentId) {
  const n = teams.length;
  if (n < 2) return [];

  const k = Math.ceil(Math.log2(n));
  const P = 1 << k;

  let seeds = [0, 1];
  while (seeds.length < P) {
    const nextSeeds = [];
    const targetSum = seeds.length * 2 - 1;
    for (const s of seeds) {
      nextSeeds.push(s);
      nextSeeds.push(targetSum - s);
    }
    seeds = nextSeeds;
  }

  const leaves = [];
  for (const s of seeds) {
    if (s < n) {
      leaves.push({ type: 'team', team: teams[s], seed: s });
    } else {
      leaves.push({ type: 'bye', seed: s });
    }
  }

  const roundNames = {
    1: 'Grand Final',
    2: 'Semi-Final',
    3: 'Quarter-Final',
    4: 'Round of 16',
    5: 'Round of 32',
    6: 'Round of 64'
  };

  let currentLayer = leaves;
  let roundNum = 1;
  const totalRounds = k;
  const allMatches = [];
  let matchCounter = 1;

  while (currentLayer.length > 1) {
    const nextLayer = [];
    const remainingRounds = totalRounds - roundNum + 1;
    const stageName = roundNames[remainingRounds] || `Round ${roundNum}`;

    for (let i = 0; i < currentLayer.length; i += 2) {
      const node1 = currentLayer[i];
      const node2 = currentLayer[i + 1];

      if (node1.type === 'bye' && node2.type === 'bye') {
        nextLayer.push({ type: 'bye' });
      } else if (node1.type !== 'bye' && node2.type === 'bye') {
        nextLayer.push(node1);
      } else if (node1.type === 'bye' && node2.type !== 'bye') {
        nextLayer.push(node2);
      } else {
        const matchId = `fix_${tournamentId}_${matchCounter}`;
        const matchObj = {
          id: matchId,
          tournament_id: tournamentId,
          match_number: matchCounter,
          node1,
          node2,
          stage_round: remainingRounds,
          stage_name: stageName,
          round_index: roundNum
        };
        allMatches.push(matchObj);
        matchCounter++;
        nextLayer.push({ type: 'match', match: matchObj });
      }
    }

    currentLayer = nextLayer;
    roundNum++;
  }

  allMatches.sort((a, b) => a.round_index - b.round_index || a.match_number - b.match_number);

  const finalFixtures = [];
  const matchIdMap = {};
  allMatches.forEach((m, idx) => {
    const newMatchNum = idx + 1;
    const newId = `fix_${tournamentId}_${newMatchNum}`;
    matchIdMap[m.id] = { newId, newMatchNum };
  });

  const stageCounts = {};
  allMatches.forEach((m) => {
    stageCounts[m.stage_name] = (stageCounts[m.stage_name] || 0) + 1;
  });

  const stageIndices = {};
  allMatches.forEach((m, idx) => {
    const { newId, newMatchNum } = matchIdMap[m.id];
    const sn = m.stage_name;
    stageIndices[sn] = (stageIndices[sn] || 0) + 1;
    const stageDisplay = stageCounts[sn] > 1 ? `${sn} ${stageIndices[sn]}` : sn;

    let t1_id, t1_name, t1_short, t1_color;
    let t2_id, t2_name, t2_short, t2_color;

    if (m.node1.type === 'team') {
      t1_id = m.node1.team.id;
      t1_name = m.node1.team.name;
      t1_short = m.node1.team.short_name || 'T1';
      t1_color = m.node1.team.color || '#ed6a4e';
    } else {
      const prev = matchIdMap[m.node1.match.id];
      t1_id = `TBD_M${prev.newMatchNum}`;
      t1_name = `TBD (Winner Match #${prev.newMatchNum})`;
      t1_short = 'TBD';
      t1_color = '#64748b';
    }

    if (m.node2.type === 'team') {
      t2_id = m.node2.team.id;
      t2_name = m.node2.team.name;
      t2_short = m.node2.team.short_name || 'T2';
      t2_color = m.node2.team.color || '#3b82f6';
    } else {
      const prev = matchIdMap[m.node2.match.id];
      t2_id = `TBD_M${prev.newMatchNum}`;
      t2_name = `TBD (Winner Match #${prev.newMatchNum})`;
      t2_short = 'TBD';
      t2_color = '#64748b';
    }

    finalFixtures.push({
      id: newId,
      tournament_id: tournamentId,
      match_number: newMatchNum,
      team1_id: t1_id,
      team1_name: t1_name,
      team1_short: t1_short,
      team1_color: t1_color,
      team2_id: t2_id,
      team2_name: t2_name,
      team2_short: t2_short,
      team2_color: t2_color,
      venue: m.stage_round > 1 ? `Pitch ${((newMatchNum - 1) % 4) + 1} Ground` : 'Grand Arena Stadium',
      match_date: stageDisplay,
      stage: stageDisplay,
      status: 'upcoming',
      winner_team_id: null,
      result_text: null
    });
  });

  allMatches.forEach((m, idx) => {
    for (const futureM of allMatches) {
      if (futureM.node1.type === 'match' && futureM.node1.match.id === m.id) {
        finalFixtures[idx].next_fixture_id = matchIdMap[futureM.id].newId;
        finalFixtures[idx].next_slot = 1;
        break;
      } else if (futureM.node2.type === 'match' && futureM.node2.match.id === m.id) {
        finalFixtures[idx].next_fixture_id = matchIdMap[futureM.id].newId;
        finalFixtures[idx].next_slot = 2;
        break;
      }
    }
  });

  return finalFixtures;
}

// ----------------------------------------------------
// MATCH INITIALIZATION
// ----------------------------------------------------

function initMatchFromFixture(fixture) {
  const tour = appState.tournament;
  if (!tour || !tour.teams) return;

  const t1 = tour.teams.find((t) => t.id === fixture.team1_id) || tour.teams[0];
  const t2 = tour.teams.find((t) => t.id === fixture.team2_id) || tour.teams[1 % tour.teams.length];

  const oversLimit = tour.overs || 20;
  appState.activeMatch = createNewMatchState(t1, t2, oversLimit, fixture.id);
  saveToLocalStorage();
}

function createNewMatchState(team1, team2, oversLimit = 20, fixtureId = null) {
  const t1Players = team1.players && team1.players.length > 0 ? team1.players : DEFAULT_SAMPLE_TEAMS[0].players;
  const t2Players = team2.players && team2.players.length > 0 ? team2.players : DEFAULT_SAMPLE_TEAMS[1].players;

  const playing11_T1 = t1Players.slice(0, 11);
  const playing11_T2 = t2Players.slice(0, 11);

  const inn1Batters = playing11_T1.map((p, idx) => ({
    player_id: p.id || `p_t1_${idx + 1}`,
    name: p.name,
    role: p.role || 'Batter',
    is_captain: Boolean(p.is_captain),
    is_vice_captain: Boolean(p.is_vice_captain),
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    is_out: false,
    dismissal: 'not out',
    is_striker: idx === 0,
    is_non_striker: idx === 1
  }));

  const inn1Bowlers = playing11_T2.map((p, idx) => ({
    player_id: p.id || `p_t2_${idx + 1}`,
    name: p.name,
    role: p.role || 'Bowler',
    is_captain: Boolean(p.is_captain),
    is_vice_captain: Boolean(p.is_vice_captain),
    legal_balls: 0,
    maidens: 0,
    runs: 0,
    wickets: 0,
    dots: 0,
    is_current: idx === playing11_T2.length - 1
  }));

  const inn2Batters = playing11_T2.map((p, idx) => ({
    player_id: p.id || `p_t2_${idx + 1}`,
    name: p.name,
    role: p.role || 'Batter',
    is_captain: Boolean(p.is_captain),
    is_vice_captain: Boolean(p.is_vice_captain),
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    is_out: false,
    dismissal: 'not out',
    is_striker: idx === 0,
    is_non_striker: idx === 1
  }));

  const inn2Bowlers = playing11_T1.map((p, idx) => ({
    player_id: p.id || `p_t1_${idx + 1}`,
    name: p.name,
    role: p.role || 'Bowler',
    is_captain: Boolean(p.is_captain),
    is_vice_captain: Boolean(p.is_vice_captain),
    legal_balls: 0,
    maidens: 0,
    runs: 0,
    wickets: 0,
    dots: 0,
    is_current: idx === playing11_T1.length - 1
  }));

  return {
    id: `match_${Date.now()}`,
    tournament_id: appState.tournament?.id,
    fixture_id: fixtureId,
    overs_limit: oversLimit,
    team1: { ...team1, players: t1Players },
    team2: { ...team2, players: t2Players },
    current_innings: 1,
    innings1: {
      batting_team_id: team1.id,
      batting_team_name: team1.name,
      batting_team_short: team1.short_name,
      bowling_team_id: team2.id,
      bowling_team_name: team2.name,
      runs: 0,
      wickets: 0,
      balls: 0,
      extras: { wides: 0, no_balls: 0, byes: 0, leg_byes: 0, total: 0 },
      striker_id: inn1Batters[0]?.player_id,
      non_striker_id: inn1Batters[1]?.player_id,
      current_bowler_id: inn1Bowlers[inn1Bowlers.length - 1]?.player_id,
      last_bowler_id: null,
      batters: inn1Batters,
      bowlers: inn1Bowlers,
      fall_of_wickets: [],
      current_over_balls: [],
      timeline_balls: [],
      partnership: { runs: 0, balls: 0 },
      is_completed: false
    },
    innings2: {
      batting_team_id: team2.id,
      batting_team_name: team2.name,
      batting_team_short: team2.short_name,
      bowling_team_id: team1.id,
      bowling_team_name: team1.name,
      runs: 0,
      wickets: 0,
      balls: 0,
      extras: { wides: 0, no_balls: 0, byes: 0, leg_byes: 0, total: 0 },
      striker_id: inn2Batters[0]?.player_id,
      non_striker_id: inn2Batters[1]?.player_id,
      current_bowler_id: inn2Bowlers[inn2Bowlers.length - 1]?.player_id,
      last_bowler_id: null,
      batters: inn2Batters,
      bowlers: inn2Bowlers,
      fall_of_wickets: [],
      current_over_balls: [],
      timeline_balls: [],
      partnership: { runs: 0, balls: 0 },
      is_completed: false
    },
    target: null,
    is_match_completed: false,
    winner_team_id: null,
    victory_margin: null,
    result_text: null,
    awards: null,
    history: []
  };
}

// ----------------------------------------------------
// LIVE CRICKET SCORING ENGINE
// ----------------------------------------------------

function getCurrentInnings() {
  if (!appState.activeMatch) ensureValidActiveMatch();
  const inn = appState.activeMatch.current_innings === 1
    ? appState.activeMatch.innings1
    : appState.activeMatch.innings2;

  if (!inn.striker_id && inn.batters && inn.batters.length > 0) {
    inn.striker_id = inn.batters[0].player_id;
  }
  if (!inn.non_striker_id && inn.batters && inn.batters.length > 1) {
    inn.non_striker_id = inn.batters[1].player_id;
  }
  if (!inn.current_bowler_id && inn.bowlers && inn.bowlers.length > 0) {
    inn.current_bowler_id = inn.bowlers[inn.bowlers.length - 1].player_id;
  }

  return inn;
}

function cloneCurrentState() {
  const match = appState.activeMatch;
  if (!match) return null;
  const { history, ...cleanMatch } = match;
  return JSON.parse(JSON.stringify(cleanMatch));
}

function recordBall(runsScored, extraType = null, isWicket = false, wicketDetails = null) {
  const match = appState.activeMatch;
  if (!match) ensureValidActiveMatch();
  if (match.is_match_completed) {
    showToast('Match is already completed');
    return;
  }

  const inn = getCurrentInnings();
  if (inn.is_completed) {
    showToast('Current innings is completed');
    return;
  }

  if (!match.history) match.history = [];
  const stateSnapshot = cloneCurrentState();
  if (stateSnapshot) {
    match.history.push(stateSnapshot);
    if (match.history.length > 15) match.history.shift();
  }

  let striker = inn.batters.find((b) => b.player_id === inn.striker_id) || inn.batters[0];
  let bowler = inn.bowlers.find((b) => b.player_id === inn.current_bowler_id) || inn.bowlers[0];

  let isLegalBall = true;
  let ballDisplayText = '';
  let ballClass = '';

  if (extraType === 'WD') {
    isLegalBall = false;
    const runs = 1 + runsScored;
    inn.runs += runs;
    inn.extras.wides += runs;
    inn.extras.total += runs;
    bowler.runs += runs;
    ballDisplayText = runsScored > 0 ? `${1 + runsScored}Wd` : 'Wd';
    ballClass = 'ball-extra';
    showToast(`Wide (+${runs} run${runs === 1 ? '' : 's'})`);
  } else if (extraType === 'NB') {
    isLegalBall = false;
    const runs = 1 + runsScored;
    inn.runs += runs;
    inn.extras.no_balls += 1;
    inn.extras.total += 1;
    bowler.runs += runs;
    if (runsScored > 0 && striker) {
      striker.runs += runsScored;
      striker.balls += 1;
      if (runsScored === 4) striker.fours += 1;
      if (runsScored === 6) striker.sixes += 1;
    }
    ballDisplayText = runsScored > 0 ? `${1 + runsScored}Nb` : 'Nb';
    ballClass = 'ball-extra';
    showToast(`No Ball (+${runs} run${runs === 1 ? '' : 's'})`);
  } else if (extraType === 'LB' || extraType === 'B') {
    isLegalBall = true;
    inn.runs += runsScored;
    inn.balls += 1;
    bowler.legal_balls += 1;
    if (striker) striker.balls += 1;
    if (runsScored === 0) bowler.dots += 1;
    if (extraType === 'LB') {
      inn.extras.leg_byes += runsScored;
      ballDisplayText = `${runsScored}Lb`;
    } else {
      inn.extras.byes += runsScored;
      ballDisplayText = `${runsScored}B`;
    }
    inn.extras.total += runsScored;
    ballClass = 'ball-extra';
    showToast(`${extraType === 'LB' ? 'Leg Bye' : 'Bye'} (${runsScored} runs)`);
  } else if (isWicket) {
    isLegalBall = true;
    inn.balls += 1;
    bowler.legal_balls += 1;
    const wktType = wicketDetails?.type || 'Bowled';

    // In cricket, Run Out wickets are NOT credited to the bowler
    if (wktType !== 'Run Out') {
      bowler.wickets += 1;
    }
    inn.wickets += 1;

    // Completed runs on Run Out delivery
    if (runsScored > 0) {
      inn.runs += runsScored;
      bowler.runs += runsScored;
      if (striker) striker.runs += runsScored;
    }

    if (striker) striker.balls += 1;

    const outBatterId = wicketDetails?.outBatterId || inn.striker_id;
    const outBatter = inn.batters.find((b) => b.player_id === outBatterId) || striker;

    if (outBatter) {
      outBatter.is_out = true;
      const bName = bowler?.name || 'Bowler';
      let dismissalStr = `b ${bName}`;
      if (wktType === 'Caught') {
        dismissalStr = wicketDetails?.fielder ? `c ${wicketDetails.fielder} b ${bName}` : `c & b ${bName}`;
      } else if (wktType === 'Run Out') {
        dismissalStr = wicketDetails?.fielder ? `run out (${wicketDetails.fielder})` : 'run out';
      } else if (wktType === 'LBW') {
        dismissalStr = `lbw b ${bName}`;
      } else if (wktType === 'Stumped') {
        dismissalStr = `st b ${bName}`;
      } else if (wktType === 'Hit Wicket') {
        dismissalStr = `hit wicket b ${bName}`;
      }
      outBatter.dismissal = dismissalStr;
    }

    const overStr = `${Math.floor(inn.balls / 6)}.${inn.balls % 6}`;
    inn.fall_of_wickets.push({
      score: inn.runs,
      wicket_number: inn.wickets,
      batter_name: outBatter?.name || 'Batter',
      over_str: overStr
    });

    ballDisplayText = wktType === 'Run Out' ? (runsScored > 0 ? `${runsScored}RO` : 'RO') : 'W';
    ballClass = 'ball-wicket';
    showToast(`Wicket! ${outBatter?.name || 'Batter'} out (${wktType}${runsScored > 0 ? ` +${runsScored} runs` : ''})`);

    if (wicketDetails?.nextBatterId) {
      if (outBatterId === inn.striker_id) {
        inn.striker_id = wicketDetails.nextBatterId;
      } else {
        inn.non_striker_id = wicketDetails.nextBatterId;
      }
    }
  } else {
    isLegalBall = true;
    inn.runs += runsScored;
    inn.balls += 1;
    bowler.legal_balls += 1;
    bowler.runs += runsScored;
    if (runsScored === 0) bowler.dots += 1;
    if (striker) {
      striker.runs += runsScored;
      striker.balls += 1;
      if (runsScored === 4) striker.fours += 1;
      if (runsScored === 6) striker.sixes += 1;
    }

    ballDisplayText = runsScored === 0 ? '•' : `${runsScored}`;
    if (runsScored === 4) {
      ballClass = 'ball-four';
      showToast('FOUR! 4 runs');
    } else if (runsScored === 6) {
      ballClass = 'ball-six';
      showToast('SIX! 6 runs');
    }
  }

  // Partnership
  if (isWicket) {
    inn.partnership = { runs: 0, balls: 0 };
  } else {
    inn.partnership.runs += runsScored + (extraType === 'WD' || extraType === 'NB' ? 1 : 0);
    if (isLegalBall) inn.partnership.balls += 1;
  }

  // Delivery log
  const overNumber = Math.floor((inn.balls - (isLegalBall ? 1 : 0)) / 6);
  const ballInOver = isLegalBall ? ((inn.balls - 1) % 6) + 1 : inn.balls % 6;
  const deliveryNumber = `${overNumber}.${ballInOver}`;

  const ballEvent = {
    delivery: deliveryNumber,
    text: ballDisplayText,
    className: ballClass,
    runs: runsScored,
    extra: extraType,
    isWicket,
    bowler: bowler?.name,
    striker: striker?.name
  };

  inn.current_over_balls.push(ballEvent);
  inn.timeline_balls.unshift(ballEvent);
  if (inn.timeline_balls.length > 20) inn.timeline_balls.pop();

  if (runsScored === 1 || runsScored === 3 || runsScored === 5) {
    swapStrike(false);
  }

  if (isLegalBall && inn.balls > 0 && inn.balls % 6 === 0) {
    handleOverCompleted();
  }

  checkMatchProgress();
  saveToLocalStorage();

  if (match.is_match_completed || inn.is_completed) {
    renderAllViews();
  } else {
    renderScoreboardView();
  }
}

function swapStrike(userTriggered = true) {
  const inn = getCurrentInnings();
  if (!inn) return;
  const temp = inn.striker_id;
  inn.striker_id = inn.non_striker_id;
  inn.non_striker_id = temp;
  if (userTriggered) {
    saveToLocalStorage();
    renderScoreboardView();
  }
}

function handleOverCompleted() {
  const inn = getCurrentInnings();
  if (!inn) return;

  const bowler = inn.bowlers.find((b) => b.player_id === inn.current_bowler_id);
  const overBalls = inn.current_over_balls;
  const runsConcededInOver = overBalls.reduce((sum, b) => sum + (b.runs || 0) + (b.extra === 'WD' || b.extra === 'NB' ? 1 : 0), 0);
  if (runsConcededInOver === 0 && bowler) {
    bowler.maidens += 1;
    showToast(`Maiden over for ${bowler.name}! `);
  }

  inn.last_bowler_id = inn.current_bowler_id;
  inn.current_over_balls = [];
  swapStrike(false);

  const maxBalls = (appState.activeMatch.overs_limit || 20) * 6;
  if (inn.balls < maxBalls && inn.wickets < inn.batters.length - 1) {
    openBowlerModal();
  }
}

function checkMatchProgress() {
  const match = appState.activeMatch;
  const inn = getCurrentInnings();
  const maxBalls = (match.overs_limit || 20) * 6;
  const maxWickets = match.is_super_over ? 2 : inn.batters.length - 1;

  if (match.current_innings === 1) {
    if (inn.balls >= maxBalls || inn.wickets >= maxWickets) {
      inn.is_completed = true;
      match.target = inn.runs + 1;
      match.current_innings = 2;
      showToast(`${match.is_super_over ? 'Super Over ' : ''}1st Innings finished! Target: ${match.target} runs`);
    }
  } else {
    const target = match.target || (match.innings1.runs + 1);

    if (inn.runs >= target) {
      inn.is_completed = true;
      match.is_match_completed = true;
      match.winner_team_id = inn.batting_team_id;
      const wicketsRemaining = maxWickets - inn.wickets;
      match.victory_margin = match.is_super_over 
        ? `in Super Over by ${wicketsRemaining} wicket${wicketsRemaining === 1 ? '' : 's'}`
        : `by ${wicketsRemaining} wicket${wicketsRemaining === 1 ? '' : 's'}`;
      match.result_text = `${inn.batting_team_name.replace(' (Super Over)', '')} won ${match.victory_margin}`;
      concludeMatch();
    } else if (inn.balls >= maxBalls || inn.wickets >= maxWickets) {
      inn.is_completed = true;
      match.is_match_completed = true;
      if (inn.runs === target - 1) {
        if (match.is_super_over) {
          decideWinnerByBoundaries();
        } else {
          openTieBreakerModal();
        }
      } else {
        const runMargin = match.innings1.runs - inn.runs;
        match.winner_team_id = match.innings1.batting_team_id;
        match.victory_margin = match.is_super_over
          ? `in Super Over by ${runMargin} run${runMargin === 1 ? '' : 's'}`
          : `by ${runMargin} run${runMargin === 1 ? '' : 's'}`;
        match.result_text = `${match.innings1.batting_team_name.replace(' (Super Over)', '')} won ${match.victory_margin}`;
        concludeMatch();
      }
    }
  }
}

// ----------------------------------------------------
// TIE-BREAKER LOGIC (Super Over & Boundary Count)
// ----------------------------------------------------

function openTieBreakerModal() {
  const match = appState.activeMatch;
  if (!match) return;

  const tSummary = document.querySelector('#tieScoresSummary');
  if (tSummary) {
    tSummary.textContent = `${match.team1.name} ${match.innings1.runs}/${match.innings1.wickets} vs ${match.team2.name} ${match.innings2.runs}/${match.innings2.wickets}`;
  }

  const modal = document.querySelector('#tieBreakerModal');
  if (modal) modal.classList.add('show');
}

function closeTieBreakerModal() {
  const modal = document.querySelector('#tieBreakerModal');
  if (modal) modal.classList.remove('show');
}

function startSuperOver() {
  closeTieBreakerModal();
  const match = appState.activeMatch;
  if (!match) return;

  // Save the main match scores before Super Over
  match.main_match_innings1 = JSON.parse(JSON.stringify(match.innings1));
  match.main_match_innings2 = JSON.parse(JSON.stringify(match.innings2));
  match.is_super_over = true;
  match.is_match_completed = false;
  match.overs_limit = 1;
  match.current_innings = 1;
  match.target = null;
  match.history = [];

  const soTeam1 = match.team2;
  const soTeam2 = match.team1;

  const soT1Players = (soTeam1.players && soTeam1.players.length > 0 ? soTeam1.players : DEFAULT_SAMPLE_TEAMS[0].players).slice(0, 3);
  const soT2Players = (soTeam2.players && soTeam2.players.length > 0 ? soTeam2.players : DEFAULT_SAMPLE_TEAMS[1].players).slice(0, 3);

  match.innings1 = {
    batting_team_id: soTeam1.id,
    batting_team_name: `${soTeam1.name} (Super Over)`,
    batting_team_short: soTeam1.short_name,
    bowling_team_id: soTeam2.id,
    bowling_team_name: soTeam2.name,
    runs: 0,
    wickets: 0,
    balls: 0,
    extras: { wides: 0, no_balls: 0, leg_byes: 0, byes: 0, penalty: 0, total: 0 },
    batters: soT1Players.map((p, idx) => ({
      player_id: p.id || `p_so1_${idx + 1}`,
      name: p.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      is_out: false,
      dismissal: 'not out',
      is_striker: idx === 0,
      is_non_striker: idx === 1
    })),
    bowlers: soT2Players.map((p, idx) => ({
      player_id: p.id || `p_so2_${idx + 1}`,
      name: p.name,
      legal_balls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      dots: 0
    })),
    striker_id: soT1Players[0]?.id || 'p_so1_1',
    non_striker_id: soT1Players[1]?.id || 'p_so1_2',
    current_bowler_id: soT2Players[0]?.id || 'p_so2_1',
    current_over_balls: [],
    timeline_balls: [],
    partnership: { runs: 0, balls: 0 },
    fall_of_wickets: [],
    is_completed: false
  };

  match.innings2 = {
    batting_team_id: soTeam2.id,
    batting_team_name: `${soTeam2.name} (Super Over)`,
    batting_team_short: soTeam2.short_name,
    bowling_team_id: soTeam1.id,
    bowling_team_name: soTeam1.name,
    runs: 0,
    wickets: 0,
    balls: 0,
    extras: { wides: 0, no_balls: 0, leg_byes: 0, byes: 0, penalty: 0, total: 0 },
    batters: soT2Players.map((p, idx) => ({
      player_id: p.id || `p_so2_${idx + 1}`,
      name: p.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      is_out: false,
      dismissal: 'not out',
      is_striker: idx === 0,
      is_non_striker: idx === 1
    })),
    bowlers: soT1Players.map((p, idx) => ({
      player_id: p.id || `p_so1_${idx + 1}`,
      name: p.name,
      legal_balls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      dots: 0
    })),
    striker_id: soT2Players[0]?.id || 'p_so2_1',
    non_striker_id: soT2Players[1]?.id || 'p_so2_2',
    current_bowler_id: soT1Players[0]?.id || 'p_so1_1',
    current_over_balls: [],
    timeline_balls: [],
    partnership: { runs: 0, balls: 0 },
    fall_of_wickets: [],
    is_completed: false
  };

  saveToLocalStorage(true);
  renderScoreboardView();
  showToast('Super Over started! 1 Over (6 balls) shootout');
}

function decideWinnerByBoundaries() {
  closeTieBreakerModal();
  const match = appState.activeMatch;
  if (!match) return;

  const t1_fours = (match.innings1.batters || []).reduce((s, b) => s + (b.fours || 0), 0);
  const t1_sixes = (match.innings1.batters || []).reduce((s, b) => s + (b.sixes || 0), 0);
  const t1_boundaries = t1_fours + t1_sixes;

  const t2_fours = (match.innings2.batters || []).reduce((s, b) => s + (b.fours || 0), 0);
  const t2_sixes = (match.innings2.batters || []).reduce((s, b) => s + (b.sixes || 0), 0);
  const t2_boundaries = t2_fours + t2_sixes;

  if (t1_boundaries > t2_boundaries) {
    match.winner_team_id = match.innings1.batting_team_id;
    match.victory_margin = `on boundary count (${t1_boundaries} boundaries vs ${t2_boundaries})`;
    match.result_text = `${match.innings1.batting_team_name.replace(' (Super Over)', '')} won ${match.victory_margin}`;
  } else if (t2_boundaries > t1_boundaries) {
    match.winner_team_id = match.innings2.batting_team_id;
    match.victory_margin = `on boundary count (${t2_boundaries} boundaries vs ${t1_boundaries})`;
    match.result_text = `${match.innings2.batting_team_name.replace(' (Super Over)', '')} won ${match.victory_margin}`;
  } else {
    if (t1_sixes > t2_sixes) {
      match.winner_team_id = match.innings1.batting_team_id;
      match.victory_margin = `on most sixes count (${t1_sixes} vs ${t2_sixes} sixes)`;
      match.result_text = `${match.innings1.batting_team_name.replace(' (Super Over)', '')} won ${match.victory_margin}`;
    } else if (t2_sixes > t1_sixes) {
      match.winner_team_id = match.innings2.batting_team_id;
      match.victory_margin = `on most sixes count (${t2_sixes} vs ${t1_sixes} sixes)`;
      match.result_text = `${match.innings2.batting_team_name.replace(' (Super Over)', '')} won ${match.victory_margin}`;
    } else {
      match.winner_team_id = null;
      match.victory_margin = `Match Tied (Equal Boundaries: ${t1_boundaries})`;
      match.result_text = 'Match Tied (Equal Runs & Boundaries)!';
    }
  }

  concludeMatch();
}

function acceptMatchTied() {
  closeTieBreakerModal();
  const match = appState.activeMatch;
  if (!match) return;
  match.winner_team_id = null;
  match.victory_margin = 'Match Tied';
  match.result_text = 'Match Tied!';
  concludeMatch();
}

function concludeMatch() {
  const match = appState.activeMatch;
  calculateAwards();

  if (appState.tournament) {
    updateTournamentStandingsAndStats(match);
  }

  apiFetch('/api/matches', 'POST', match);
  openVictoryModal();
}

function undoLastBall() {
  const match = appState.activeMatch;
  if (!match || !match.history || match.history.length === 0) {
    showToast('Nothing to undo');
    return;
  }
  const previousState = match.history.pop();
  Object.assign(match, previousState);
  saveToLocalStorage();
  renderScoreboardView();
  showToast('Last ball undone');
}

// ----------------------------------------------------
// AWARDS CALCULATION
// ----------------------------------------------------

function calculateAwards() {
  const match = appState.activeMatch;
  if (!match) return;

  const playerPoints = [];

  [match.innings1, match.innings2].forEach((inn) => {
    inn.batters.forEach((b) => {
      let pts = (b.runs * 1) + (b.fours * 1) + (b.sixes * 2);
      if (b.runs >= 50) pts += 15;
      if (b.runs >= 100) pts += 25;
      if (b.balls >= 10) {
        const sr = (b.runs / b.balls) * 100;
        if (sr >= 170) pts += 10;
        else if (sr >= 140) pts += 6;
      }
      playerPoints.push({
        player_id: b.player_id,
        name: b.name,
        team_id: inn.batting_team_id,
        team_name: inn.batting_team_name,
        role: b.role || 'Batter',
        is_captain: b.is_captain,
        is_vice_captain: b.is_vice_captain,
        runs: b.runs,
        balls: b.balls,
        fours: b.fours,
        sixes: b.sixes,
        wickets: 0,
        maidens: 0,
        runs_conceded: 0,
        points: pts,
        type: 'batting'
      });
    });

    inn.bowlers.forEach((bw) => {
      if (bw.legal_balls === 0) return;
      let pts = (bw.wickets * 25) + (bw.maidens * 10) + (bw.dots * 1);
      if (bw.wickets >= 3) pts += 15;
      if (bw.wickets >= 5) pts += 30;
      const overs = bw.legal_balls / 6;
      if (overs >= 2) {
        const econ = bw.runs / overs;
        if (econ <= 6.0) pts += 12;
        else if (econ <= 7.5) pts += 6;
      }
      playerPoints.push({
        player_id: bw.player_id,
        name: bw.name,
        team_id: inn.bowling_team_id,
        team_name: inn.bowling_team_name,
        role: bw.role || 'Bowler',
        is_captain: bw.is_captain,
        is_vice_captain: bw.is_vice_captain,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        wickets: bw.wickets,
        maidens: bw.maidens,
        runs_conceded: bw.runs,
        balls_bowled: bw.legal_balls,
        points: pts,
        type: 'bowling'
      });
    });
  });

  playerPoints.sort((a, b) => b.points - a.points);
  const potm = playerPoints[0] || { name: 'Arjun Mehta', runs: 0, balls: 0, points: 0 };
  const batList = playerPoints.filter((p) => p.type === 'batting').sort((a, b) => b.runs - a.runs || b.points - a.points);
  const bestBat = batList[0] || potm;
  const bowlList = playerPoints.filter((p) => p.type === 'bowling').sort((a, b) => b.wickets - a.wickets || a.runs_conceded - b.runs_conceded);
  const bestBowl = bowlList[0] || potm;

  match.awards = { potm, best_batsman: bestBat, best_bowler: bestBowl };
}

// ----------------------------------------------------
// TOURNAMENT STANDINGS & NRR ENGINE
// ----------------------------------------------------

function updateTournamentStandingsAndStats(match) {
  const tour = appState.tournament;
  if (!tour || !tour.points_table) return;

  const inn1 = match.innings1;
  const inn2 = match.innings2;

  const t1Row = tour.points_table.find((r) => r.team_id === match.team1.id);
  const t2Row = tour.points_table.find((r) => r.team_id === match.team2.id);

  if (t1Row && t2Row) {
    t1Row.played += 1;
    t2Row.played += 1;

    t1Row.runs_scored += inn1.runs;
    t1Row.balls_faced += inn1.balls;
    t1Row.runs_conceded += inn2.runs;
    t1Row.balls_bowled += inn2.balls;

    t2Row.runs_scored += inn2.runs;
    t2Row.balls_faced += inn2.balls;
    t2Row.runs_conceded += inn1.runs;
    t2Row.balls_bowled += inn1.balls;

    if (match.winner_team_id === match.team1.id) {
      t1Row.won += 1;
      t1Row.points += 2;
      t1Row.form = ['W', ...(t1Row.form || [])].slice(0, 5);
      t2Row.lost += 1;
      t2Row.form = ['L', ...(t2Row.form || [])].slice(0, 5);
    } else if (match.winner_team_id === match.team2.id) {
      t2Row.won += 1;
      t2Row.points += 2;
      t2Row.form = ['W', ...(t2Row.form || [])].slice(0, 5);
      t1Row.lost += 1;
      t1Row.form = ['L', ...(t1Row.form || [])].slice(0, 5);
    } else {
      t1Row.tied += 1;
      t1Row.points += 1;
      t1Row.form = ['T', ...(t1Row.form || [])].slice(0, 5);
      t2Row.tied += 1;
      t2Row.points += 1;
      t2Row.form = ['T', ...(t2Row.form || [])].slice(0, 5);
    }

    [t1Row, t2Row].forEach((row) => {
      const oversFaced = Math.floor(row.balls_faced / 6) + (row.balls_faced % 6) / 6;
      const oversBowled = Math.floor(row.balls_bowled / 6) + (row.balls_bowled % 6) / 6;
      const forRR = oversFaced > 0 ? row.runs_scored / oversFaced : 0;
      const againstRR = oversBowled > 0 ? row.runs_conceded / oversBowled : 0;
      row.net_run_rate = +(forRR - againstRR).toFixed(3);
    });

    tour.points_table.sort((a, b) => b.points - a.points || b.net_run_rate - a.net_run_rate || b.won - a.won);
  }

  [inn1, inn2].forEach((inn) => {
    const team = tour.teams.find((t) => t.id === inn.batting_team_id);
    if (team) {
      inn.batters.forEach((b) => {
        const p = team.players.find((pl) => pl.id === b.player_id || pl.name === b.name);
        if (p) {
          p.runs = (p.runs || 0) + b.runs;
          p.balls_faced = (p.balls_faced || 0) + b.balls;
          p.fours = (p.fours || 0) + b.fours;
          p.sixes = (p.sixes || 0) + b.sixes;
          p.high_score = Math.max(p.high_score || 0, b.runs);
          p.matches = (p.matches || 0) + 1;
        }
      });
    }

    const bowlingTeam = tour.teams.find((t) => t.id === inn.bowling_team_id);
    if (bowlingTeam) {
      inn.bowlers.forEach((bw) => {
        const p = bowlingTeam.players.find((pl) => pl.id === bw.player_id || pl.name === bw.name);
        if (p) {
          p.balls_bowled = (p.balls_bowled || 0) + bw.legal_balls;
          p.maidens = (p.maidens || 0) + bw.maidens;
          p.runs_conceded = (p.runs_conceded || 0) + bw.runs;
          p.wickets = (p.wickets || 0) + bw.wickets;
        }
      });
    }
  });

  if (match.fixture_id) {
    const fix = tour.fixtures.find((f) => f.id === match.fixture_id);
    if (fix) {
      fix.status = 'completed';
      fix.winner_team_id = match.winner_team_id;
      fix.result_text = match.result_text;

      // Knockout bracket auto-advancement
      if (fix.next_fixture_id && match.winner_team_id) {
        const nextFix = tour.fixtures.find((f) => f.id === fix.next_fixture_id);
        const winningTeam = tour.teams.find((t) => t.id === match.winner_team_id);
        if (nextFix && winningTeam) {
          if (fix.next_slot === 1 || nextFix.team1_id.startsWith('TBD')) {
            nextFix.team1_id = winningTeam.id;
            nextFix.team1_name = winningTeam.name;
            nextFix.team1_short = winningTeam.short_name;
            nextFix.team1_color = winningTeam.color;
          } else {
            nextFix.team2_id = winningTeam.id;
            nextFix.team2_name = winningTeam.name;
            nextFix.team2_short = winningTeam.short_name;
            nextFix.team2_color = winningTeam.color;
          }
        }
      }
    }
  }

  saveToLocalStorage();
}

// ----------------------------------------------------
// UI RENDERING
// ----------------------------------------------------

function renderAllViews() {
  renderScoreboardView();
  renderScorecardView();
  renderPointsTableView();
  renderFixturesView();
  renderTeamsView();
  renderLeaderboardsView();
  renderSummaryView();

  if (appState.tournament) {
    const badge = document.querySelector('#sidebarTournamentName');
    if (badge) badge.textContent = appState.tournament.name;
    const eyebrow = document.querySelector('#topbarEyebrow');
    if (eyebrow) eyebrow.textContent = appState.tournament.name;
  }
}

function renderScoreboardView() {
  const match = appState.activeMatch;
  if (!match) return;
  const inn = getCurrentInnings();
  if (!inn) return;

  const compTag = document.querySelector('#matchCompetitionTag');
  if (compTag) compTag.textContent = `${appState.tournament?.name || 'CRICKET MATCH'} • ${match.overs_limit} OVERS`;
  
  const t1Head = document.querySelector('#team1NameHead');
  if (t1Head) t1Head.textContent = match.team1.name;
  const t2Head = document.querySelector('#team2NameHead');
  if (t2Head) t2Head.textContent = match.team2.name;

  const innBadge = document.querySelector('#inningsBadge');
  if (innBadge) innBadge.textContent = `${match.current_innings === 1 ? '1st' : '2nd'} Innings`;

  const batName = document.querySelector('#battingTeamName');
  if (batName) batName.textContent = inn.batting_team_name;
  const batBadge = document.querySelector('#battingTeamBadge');
  if (batBadge) batBadge.textContent = inn.batting_team_short || inn.batting_team_name.substring(0, 3).toUpperCase();

  const scoreDisp = document.querySelector('#scoreDisplay');
  if (scoreDisp) scoreDisp.innerHTML = `${inn.runs}<span>/${inn.wickets}</span>`;

  const oversStr = `${Math.floor(inn.balls / 6)}.${inn.balls % 6}`;
  const oversDisp = document.querySelector('#oversDisplay');
  if (oversDisp) oversDisp.innerHTML = `${oversStr} <small>/ ${match.overs_limit} ov</small>`;

  const ballsLeft = Math.max(0, match.overs_limit * 6 - inn.balls);
  const ballsLeftDisp = document.querySelector('#ballsLeftDisplay');
  if (ballsLeftDisp) ballsLeftDisp.textContent = `${ballsLeft} balls remaining`;

  // Bowling team on right side
  const bowlName = document.querySelector('#bowlingTeamName');
  if (bowlName) bowlName.textContent = inn.bowling_team_name;
  const bowlBadge = document.querySelector('#bowlingTeamBadge');
  const bowlShort = (match.current_innings === 1 ? match.team2.short_name : match.team1.short_name) || inn.bowling_team_name.substring(0, 3).toUpperCase();
  if (bowlBadge) bowlBadge.textContent = bowlShort;
  const bowlOvers = document.querySelector('#bowlingOversDisplay');
  if (bowlOvers) bowlOvers.innerHTML = `${oversStr} <small>/ ${match.overs_limit} ov</small>`;
  const bowlWkts = document.querySelector('#bowlingWicketsDisplay');
  if (bowlWkts) bowlWkts.textContent = `${inn.wickets} wicket${inn.wickets === 1 ? '' : 's'} taken`;

  // Center Run Rate & Target
  const oversDecimal = Math.floor(inn.balls / 6) + (inn.balls % 6) / 6;
  const crr = oversDecimal > 0 ? (inn.runs / oversDecimal).toFixed(2) : '0.00';
  const rrDisp = document.querySelector('#runRateDisplay');
  if (rrDisp) rrDisp.textContent = crr;

  const targetCard = document.querySelector('#targetCard');
  const rrrBox = document.querySelector('#requiredRRBox');
  if (match.current_innings === 2 && match.target) {
    if (targetCard) targetCard.style.display = 'block';
    if (rrrBox) rrrBox.style.display = 'flex';
    const runsNeeded = Math.max(0, match.target - inn.runs);
    const trgRuns = document.querySelector('#targetRunsDisplay');
    if (trgRuns) trgRuns.textContent = match.target;
    const trgSub = document.querySelector('#targetSubDisplay');
    if (trgSub) trgSub.textContent = `Need ${runsNeeded} runs in ${ballsLeft} balls`;
    const rrr = ballsLeft > 0 ? ((runsNeeded / ballsLeft) * 6).toFixed(2) : '0.00';
    const reqRRDisp = document.querySelector('#reqRunRateDisplay');
    if (reqRRDisp) reqRRDisp.textContent = rrr;
  } else {
    if (targetCard) targetCard.style.display = 'none';
    if (rrrBox) rrrBox.style.display = 'none';
  }

  const striker = inn.batters.find((b) => b.player_id === inn.striker_id) || inn.batters[0] || { name: 'Striker', runs: 0, balls: 0, fours: 0, sixes: 0 };
  const nonStriker = inn.batters.find((b) => b.player_id === inn.non_striker_id) || inn.batters[1] || { name: 'Non-Striker', runs: 0, balls: 0, fours: 0, sixes: 0 };

  const onStrikeEl = document.querySelector('#onStrikeName');
  if (onStrikeEl) onStrikeEl.innerHTML = formatPlayerName(striker);
  const stName = document.querySelector('#strikerName');
  if (stName) stName.innerHTML = formatPlayerName(striker);
  const stRuns = document.querySelector('#strikerRuns');
  if (stRuns) stRuns.textContent = striker.runs;
  const stBalls = document.querySelector('#strikerBalls');
  if (stBalls) stBalls.textContent = striker.balls;
  const stFours = document.querySelector('#strikerFours');
  if (stFours) stFours.textContent = striker.fours;
  const stSixes = document.querySelector('#strikerSixes');
  if (stSixes) stSixes.textContent = striker.sixes;
  const stSR = document.querySelector('#strikerSR');
  if (stSR) stSR.textContent = striker.balls > 0 ? ((striker.runs / striker.balls) * 100).toFixed(1) : '0.0';

  const nstName = document.querySelector('#nonStrikerName');
  if (nstName) nstName.innerHTML = formatPlayerName(nonStriker);
  const nstRuns = document.querySelector('#nonStrikerRuns');
  if (nstRuns) nstRuns.textContent = nonStriker.runs;
  const nstBalls = document.querySelector('#nonStrikerBalls');
  if (nstBalls) nstBalls.textContent = nonStriker.balls;
  const nstFours = document.querySelector('#nonStrikerFours');
  if (nstFours) nstFours.textContent = nonStriker.fours;
  const nstSixes = document.querySelector('#nonStrikerSixes');
  if (nstSixes) nstSixes.textContent = nonStriker.sixes;
  const nstSR = document.querySelector('#nonStrikerSR');
  if (nstSR) nstSR.textContent = nonStriker.balls > 0 ? ((nonStriker.runs / nonStriker.balls) * 100).toFixed(1) : '0.0';

  // Partnership
  const pRuns = inn.partnership?.runs || 0;
  const pBalls = inn.partnership?.balls || 0;
  const pRR = pBalls > 0 ? ((pRuns / pBalls) * 6).toFixed(2) : '0.00';
  const partDisp = document.querySelector('#partnershipDisplay');
  if (partDisp) partDisp.innerHTML = `${pRuns} runs <small>(${pBalls} balls)</small>`;
  const partRR = document.querySelector('#partnershipRRDisplay');
  if (partRR) partRR.textContent = `RR: ${pRR}`;

  // Bowler
  const bowler = inn.bowlers.find((b) => b.player_id === inn.current_bowler_id) || inn.bowlers[0] || { name: 'Bowler', legal_balls: 0, maidens: 0, runs: 0, wickets: 0, dots: 0 };
  const bName = document.querySelector('#bowlerName');
  if (bName) bName.innerHTML = formatPlayerName(bowler);
  const bAvatar = document.querySelector('#bowlerAvatar');
  if (bAvatar) bAvatar.textContent = bowler.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  
  const bOversStr = `${Math.floor(bowler.legal_balls / 6)}.${bowler.legal_balls % 6}`;
  const bFig = document.querySelector('#bowlerFigures');
  if (bFig) bFig.textContent = `${bOversStr} ov • ${bowler.wickets}/${bowler.runs} • ${bowler.maidens} maiden${bowler.maidens === 1 ? '' : 's'}`;
  
  const bOversDec = Math.floor(bowler.legal_balls / 6) + (bowler.legal_balls % 6) / 6;
  const bEcon = bOversDec > 0 ? (bowler.runs / bOversDec).toFixed(2) : '0.00';
  const bEconEl = document.querySelector('#bowlerEcon');
  if (bEconEl) bEconEl.textContent = bEcon;
  const bDots = document.querySelector('#bowlerDots');
  if (bDots) bDots.textContent = bowler.dots || 0;

  // This Over Strip
  const strip = document.querySelector('#thisOverStrip');
  if (strip) {
    strip.innerHTML = '';
    if (inn.current_over_balls.length === 0) {
      strip.innerHTML = '<span class="empty-ball">-</span>';
    } else {
      inn.current_over_balls.forEach((ball) => {
        const span = document.createElement('span');
        span.textContent = ball.text;
        if (ball.className) span.className = ball.className;
        strip.appendChild(span);
      });
    }
  }

  const thisOverTotal = inn.current_over_balls.reduce((sum, b) => sum + (b.runs || 0) + (b.extra === 'WD' || b.extra === 'NB' ? 1 : 0), 0);
  const thisOverEl = document.querySelector('#thisOverRuns');
  if (thisOverEl) thisOverEl.textContent = `${thisOverTotal} runs`;

  const timelineRow = document.querySelector('#timelineRow');
  if (timelineRow) {
    const currentInnBalls = inn.timeline_balls || [];
    if (currentInnBalls.length === 0) {
      timelineRow.innerHTML = `<span class="muted" style="padding: 10px;">${match.current_innings === 1 ? '1st Innings' : '2nd Innings'} ready. Score the first ball above!</span>`;
    } else {
      timelineRow.innerHTML = '';
      currentInnBalls.forEach((ball) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `<small>${ball.delivery}</small><span class="timeline-ball ${ball.className || ''}">${ball.text}</span>`;
        timelineRow.appendChild(item);
      });
    }
  }

  const liveBadge = document.querySelector('#liveStatusBadge');
  const liveText = document.querySelector('#liveStatusText');
  if (liveBadge && liveText) {
    if (match.is_match_completed) {
      liveBadge.style.color = '#10b981';
      liveBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      liveBadge.querySelector('i').style.background = '#10b981';
      liveText.textContent = 'MATCH FINISHED';
    } else {
      liveBadge.style.color = '#ef4444';
      liveBadge.style.background = 'rgba(239, 68, 68, 0.12)';
      liveBadge.querySelector('i').style.background = '#ef4444';
      liveText.textContent = 'LIVE MATCH';
    }
  }

  // ----------------------------------------------------
  // CONVERT SCOREBOARD INTO MATCH SUMMARY WHEN COMPLETED
  // ----------------------------------------------------
  const completedSummary = document.querySelector('#scoreboardCompletedSummary');
  const scoringPanel = document.querySelector('#scoringPanel');

  if (match.is_match_completed) {
    if (scoringPanel) scoringPanel.style.display = 'none';
    if (completedSummary) {
      completedSummary.style.display = 'block';
      const wTitle = document.querySelector('#sbSummaryWinnerTitle');
      if (wTitle) wTitle.textContent = match.result_text || 'Match Concluded';
      
      const sRecap = document.querySelector('#sbSummaryScoresRecap');
      if (sRecap) {
        const inn1Text = `${match.innings1.batting_team_name}: ${match.innings1.runs}/${match.innings1.wickets} (${Math.floor(match.innings1.balls / 6)}.${match.innings1.balls % 6} ov)`;
        const inn2Text = `${match.innings2.batting_team_name}: ${match.innings2.runs}/${match.innings2.wickets} (${Math.floor(match.innings2.balls / 6)}.${match.innings2.balls % 6} ov)`;
        sRecap.textContent = `${inn1Text}  •  ${inn2Text}`;
      }

      calculateAwards();
      const potm = match.awards?.potm;
      if (potm) {
        const pName = document.querySelector('#sbSummaryPotmName');
        if (pName) pName.innerHTML = formatPlayerName(potm);
        const pInit = document.querySelector('#sbSummaryPotmInitials');
        if (pInit) pInit.textContent = potm.name.substring(0, 2).toUpperCase();
        const pStats = document.querySelector('#sbSummaryPotmStats');
        if (pStats) pStats.textContent = `${potm.runs || 0} runs (${potm.balls || 0}b), ${potm.wickets || 0} wkts`;
      }

      const bestBat = match.awards?.best_batsman;
      if (bestBat) {
        const bName = document.querySelector('#sbSummaryBatName');
        if (bName) bName.innerHTML = formatPlayerName(bestBat);
        const bInit = document.querySelector('#sbSummaryBatInitials');
        if (bInit) bInit.textContent = bestBat.name.substring(0, 2).toUpperCase();
        const bStats = document.querySelector('#sbSummaryBatStats');
        if (bStats) bStats.textContent = `${bestBat.runs || 0} runs off ${bestBat.balls || 0}b (${bestBat.balls > 0 ? ((bestBat.runs / bestBat.balls) * 100).toFixed(1) : 0} SR)`;
      }

      const bestBowl = match.awards?.best_bowler;
      if (bestBowl) {
        const bwName = document.querySelector('#sbSummaryBowlName');
        if (bwName) bwName.innerHTML = formatPlayerName(bestBowl);
        const bwInit = document.querySelector('#sbSummaryBowlInitials');
        if (bwInit) bwInit.textContent = bestBowl.name.substring(0, 2).toUpperCase();
        const bwStats = document.querySelector('#sbSummaryBowlStats');
        const bOversStr = `${Math.floor((bestBowl.balls_bowled || bestBowl.legal_balls || 0) / 6)}.${(bestBowl.balls_bowled || bestBowl.legal_balls || 0) % 6}`;
        if (bwStats) bwStats.textContent = `${bestBowl.wickets || 0}/${bestBowl.runs_conceded || bestBowl.runs || 0} (${bOversStr} ov)`;
      }

      const allBatters = [...(match.innings1?.batters || []), ...(match.innings2?.batters || [])].filter((b) => (b.balls || 0) > 0);
      const topSR = allBatters.sort((a, b) => ((b.runs || 0) / b.balls) - ((a.runs || 0) / a.balls))[0] || potm;
      if (topSR) {
        const srName = document.querySelector('#sbSummarySRName');
        if (srName) srName.innerHTML = formatPlayerName(topSR);
        const srInit = document.querySelector('#sbSummarySRInitials');
        if (srInit) srInit.textContent = topSR.name.substring(0, 2).toUpperCase();
        const srStats = document.querySelector('#sbSummarySRStats');
        if (srStats) srStats.textContent = topSR.balls > 0 ? `${((topSR.runs / topSR.balls) * 100).toFixed(1)} SR (${topSR.runs} off ${topSR.balls}b)` : 'N/A';
      }

      const nextBtn = document.querySelector('#sbStartNextMatchBtn');
      const upcomingFix = (appState.tournament?.fixtures || []).find((f) => f.status === 'upcoming' && f.id !== match.fixture_id);
      if (nextBtn) {
        if (upcomingFix) {
          const t1 = appState.tournament.teams.find((t) => t.id === upcomingFix.team1_id);
          const t2 = appState.tournament.teams.find((t) => t.id === upcomingFix.team2_id);
          nextBtn.textContent = `Start Next Match: ${t1 ? t1.short_name : 'T1'} vs ${t2 ? t2.short_name : 'T2'}`;
          nextBtn.style.display = 'inline-flex';
          nextBtn.onclick = () => {
            initMatchFromFixture(upcomingFix);
            switchView('scoreboard');
            showToast(`Match started: ${t1 ? t1.name : 'Team 1'} vs ${t2 ? t2.name : 'Team 2'}`);
          };
        } else if (appState.tournament) {
          nextBtn.textContent = 'View Final Tournament Standings';
          nextBtn.style.display = 'inline-flex';
          nextBtn.onclick = () => switchView('leaderboards');
        } else {
          nextBtn.style.display = 'none';
        }
      }
    }
  } else {
    if (scoringPanel) scoringPanel.style.display = 'block';
    if (completedSummary) completedSummary.style.display = 'none';
  }
}

function renderScorecardView() {
  const match = appState.activeMatch;
  if (!match) return;

  const scHead = document.querySelector('#scorecardHeading');
  if (scHead) scHead.textContent = `${match.team1.name} vs ${match.team2.name}`;

  renderInningsScorecardBlock(match.innings1, '#inn1BattingHeader', '#inn1TotalBadge', '#inn1BattingTable', '#inn1ExtrasRow', '#inn1FOWText', '#inn1BowlingHeader', '#inn1BowlingTable');
  renderInningsScorecardBlock(match.innings2, '#inn2BattingHeader', '#inn2TotalBadge', '#inn2BattingTable', '#inn2ExtrasRow', '#inn2FOWText', '#inn2BowlingHeader', '#inn2BowlingTable');
}

function renderInningsScorecardBlock(inn, headId, badgeId, batTableId, extraRowId, fowId, bowlHeadId, bowlTableId) {
  const hEl = document.querySelector(headId);
  if (hEl) hEl.textContent = `${inn.batting_team_name} - Batting Scorecard`;
  
  const ovStr = `${Math.floor(inn.balls / 6)}.${inn.balls % 6}`;
  const badgeEl = document.querySelector(badgeId);
  if (badgeEl) badgeEl.textContent = `${inn.runs}/${inn.wickets} (${ovStr} ov)`;

  const batTbody = document.querySelector(`${batTableId} tbody`);
  if (batTbody) {
    batTbody.innerHTML = '';
    inn.batters.forEach((b) => {
      if (!b.is_out && b.balls === 0 && b.runs === 0 && !b.is_striker && !b.is_non_striker) return;
      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${formatPlayerName(b)}</strong></td>
        <td class="muted">${b.is_out ? b.dismissal : (b.is_striker ? 'not out (striker)' : 'not out')}</td>
        <td class="text-right font-display"><strong>${b.runs}</strong></td>
        <td class="text-right">${b.balls}</td>
        <td class="text-right">${b.fours}</td>
        <td class="text-right">${b.sixes}</td>
        <td class="text-right font-display">${sr}</td>
      `;
      batTbody.appendChild(tr);
    });
  }

  const ext = inn.extras;
  const extRow = document.querySelector(extraRowId);
  if (extRow) {
    extRow.innerHTML = `
      <span>Extras: <strong>${ext.total} (b ${ext.byes}, lb ${ext.leg_byes}, w ${ext.wides}, nb ${ext.no_balls})</strong></span>
      <span>Total: <strong>${inn.runs}/${inn.wickets} (${ovStr} overs)</strong></span>
    `;
  }

  const fowEl = document.querySelector(fowId);
  if (fowEl) {
    if (inn.fall_of_wickets && inn.fall_of_wickets.length > 0) {
      fowEl.textContent = inn.fall_of_wickets.map((f) => `${f.wicket_number}-${f.score} (${f.batter_name}, ${f.over_str} ov)`).join(' • ');
    } else {
      fowEl.textContent = 'None';
    }
  }

  const bowlHead = document.querySelector(bowlHeadId);
  if (bowlHead) bowlHead.textContent = `${inn.bowling_team_name} - Bowling Figures`;
  
  const bowlTbody = document.querySelector(`${bowlTableId} tbody`);
  if (bowlTbody) {
    bowlTbody.innerHTML = '';
    inn.bowlers.forEach((bw) => {
      if (bw.legal_balls === 0) return;
      const bOvers = `${Math.floor(bw.legal_balls / 6)}.${bw.legal_balls % 6}`;
      const bDec = Math.floor(bw.legal_balls / 6) + (bw.legal_balls % 6) / 6;
      const econ = bDec > 0 ? (bw.runs / bDec).toFixed(2) : '0.00';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${formatPlayerName(bw)}</strong></td>
        <td class="text-right">${bOvers}</td>
        <td class="text-right">${bw.maidens}</td>
        <td class="text-right">${bw.runs}</td>
        <td class="text-right font-display"><strong>${bw.wickets}</strong></td>
        <td class="text-right">${econ}</td>
        <td class="text-right">${bw.dots}</td>
      `;
      bowlTbody.appendChild(tr);
    });
  }
}

function renderPointsTableView() {
  const tour = appState.tournament;
  if (!tour || !tour.points_table) return;

  const ptHead = document.querySelector('#pointsTableHeading');
  if (ptHead) ptHead.textContent = `${tour.name} - Points Table`;
  
  const tbody = document.querySelector('#pointsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (tour.schedule_mode === 'knockout') {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td colspan="9" style="text-align: center; padding: 24px; color: var(--gold);">
        <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Single-Elimination Knockout Tournament</div>
        <p class="muted" style="margin-bottom: 12px;">This tournament uses a Knockout Bracket tree format. Matches do not award league points.</p>
        <button class="btn btn-primary btn-sm" onclick="switchView('fixtures'); const bBtn = document.querySelector('#fixturesBracketToggleBtn'); if (bBtn) bBtn.click();">Open Knockout Schedule Graph / Bracket</button>
      </td>
    `;
    tbody.appendChild(tr);
    return;
  }

  tour.points_table.forEach((row, idx) => {
    const tr = document.createElement('tr');
    const formHtml = (row.form || []).map((f) => `<span class="form-pill form-${f.toLowerCase()}">${f}</span>`).join('');
    tr.innerHTML = `
      <td><strong>${idx + 1}</strong></td>
      <td>
        <div class="team-cell">
          <span class="team-icon-sm" style="background: ${row.color || '#ed6a4e'}">${row.short_name || row.team_name.substring(0, 3).toUpperCase()}</span>
          <strong>${row.team_name}</strong>
        </div>
      </td>
      <td class="text-center">${row.played}</td>
      <td class="text-center"><strong>${row.won}</strong></td>
      <td class="text-center">${row.lost}</td>
      <td class="text-center">${row.tied}</td>
      <td class="text-center font-display" style="color: var(--gold); font-size: 16px;"><strong>${row.points}</strong></td>
      <td class="text-right font-display">${row.net_run_rate >= 0 ? '+' : ''}${row.net_run_rate.toFixed(3)}</td>
      <td>${formHtml || '<span class="muted">-</span>'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderFixturesView() {
  const tour = appState.tournament;
  if (!tour || !tour.fixtures) return;

  const toggleGroup = document.querySelector('#fixturesViewToggleGroup');
  const bracketContainer = document.querySelector('#knockoutBracketContainer');
  const grid = document.querySelector('#fixturesGrid');

  if (toggleGroup) {
    toggleGroup.style.display = tour.schedule_mode === 'knockout' ? 'inline-flex' : 'none';
  }

  if (grid) {
    grid.innerHTML = '';
    tour.fixtures.forEach((fix) => {
      const card = document.createElement('div');
      card.className = 'fixture-card';

      let statusTagClass = 'status-upcoming';
      let statusText = 'Upcoming';
      if (fix.status === 'live') {
        statusTagClass = 'status-live';
        statusText = '● LIVE';
      } else if (fix.status === 'completed') {
        statusTagClass = 'status-completed';
        statusText = 'Completed';
      }

      const isTbd1 = String(fix.team1_id).startsWith('TBD');
      const isTbd2 = String(fix.team2_id).startsWith('TBD');

      card.innerHTML = `
        <div class="fixture-card-header">
          <span class="competition">${fix.stage ? `${fix.stage.toUpperCase()} • ` : `MATCH #${fix.match_number} • `}${fix.match_date || 'TBD'}</span>
          <span class="fixture-status-tag ${statusTagClass}">${statusText}</span>
        </div>
        <div class="fixture-matchup">
          <div class="matchup-team">
            <div class="matchup-team-left">
              <span class="team-icon-sm" style="background: ${isTbd1 ? '#64748b' : (fix.team1_color || '#ed6a4e')}">${isTbd1 ? '?' : fix.team1_short}</span>
              <span style="${isTbd1 ? 'color: var(--ink-muted); font-style: italic;' : ''}">${fix.team1_name}</span>
            </div>
          </div>
          <div class="matchup-team">
            <div class="matchup-team-left">
              <span class="team-icon-sm" style="background: ${isTbd2 ? '#64748b' : (fix.team2_color || '#3b82f6')}">${isTbd2 ? '?' : fix.team2_short}</span>
              <span style="${isTbd2 ? 'color: var(--ink-muted); font-style: italic;' : ''}">${fix.team2_name}</span>
            </div>
          </div>
        </div>
        ${fix.result_text ? `<div class="fixture-result-note">${fix.result_text}</div>` : `<div class="muted"> ${fix.venue || 'Stadium'}</div>`}
        <div style="margin-top: auto; padding-top: 10px;">
          <button class="btn btn-sm ${isTbd1 || isTbd2 ? 'btn-ghost' : 'btn-outline'} btn-block" onclick="startMatchFromSchedule('${fix.id}')" ${isTbd1 || isTbd2 ? 'style="opacity: 0.6;"' : ''}>
            ${fix.status === 'completed' ? 'View / Replay Match' : (isTbd1 || isTbd2 ? ' Awaiting Previous Round' : 'Score This Match ->')}
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  if (bracketContainer && tour.schedule_mode === 'knockout') {
    renderKnockoutBracketTree('#knockoutBracketContainer', tour.fixtures, tour.teams);
  }
}

function renderKnockoutBracketTree(containerSelector, fixtures, teams) {
  const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
  if (!container || !fixtures || fixtures.length === 0) return;

  const roundMap = new Map();
  fixtures.forEach((f) => {
    let stageCategory = 'Knockout Matches';
    const s = (f.stage || '').toLowerCase();
    if (s.includes('final') && !s.includes('semi') && !s.includes('quarter')) {
      stageCategory = 'Grand Final';
    } else if (s.includes('semi')) {
      stageCategory = 'Semi-Finals';
    } else if (s.includes('quarter')) {
      stageCategory = 'Quarter-Finals';
    } else if (s.includes('16')) {
      stageCategory = 'Round of 16';
    } else if (s.includes('32')) {
      stageCategory = 'Round of 32';
    } else if (s.includes('64')) {
      stageCategory = 'Round of 64';
    } else if (f.stage) {
      stageCategory = f.stage.split(' ')[0] || 'Matches';
    }

    if (!roundMap.has(stageCategory)) {
      roundMap.set(stageCategory, []);
    }
    roundMap.get(stageCategory).push(f);
  });

  let html = `<div class="bracket-tree">`;
  roundMap.forEach((matches, roundName) => {
    const isFinal = roundName.includes('Grand Final');
    html += `
      <div class="bracket-round ${isFinal ? 'final-round' : ''}">
        <div class="bracket-round-header">${roundName}</div>
    `;

    matches.forEach((fix) => {
      const isTbd1 = String(fix.team1_id).startsWith('TBD');
      const isTbd2 = String(fix.team2_id).startsWith('TBD');
      const isCompleted = fix.status === 'completed';
      const isLive = fix.status === 'live';
      const winnerId = fix.winner_team_id;

      let statusBadge = `<span class="badge" style="font-size: 10px;">#${fix.match_number}</span>`;
      if (isLive) statusBadge = `<span style="color: var(--coral); font-weight: 700; font-size: 10px;">● LIVE</span>`;
      if (isCompleted) statusBadge = `<span style="color: var(--emerald); font-weight: 700; font-size: 10px;"> FINAL</span>`;

      html += `
        <div class="bracket-match-card ${isFinal ? 'is-final' : ''}" onclick="startMatchFromSchedule('${fix.id}')">
          <div class="bracket-match-head">
            <span>${fix.stage || `Match #${fix.match_number}`}</span>
            ${statusBadge}
          </div>
          <div class="bracket-team-row ${winnerId && winnerId === fix.team1_id ? 'winner' : ''}">
            <div class="bracket-team-info">
              <span class="team-icon-sm" style="width: 20px; height: 20px; font-size: 10px; background: ${isTbd1 ? '#64748b' : (fix.team1_color || '#ed6a4e')}">${isTbd1 ? '?' : (fix.team1_short || 'T1')}</span>
              <span style="${isTbd1 ? 'color: var(--ink-muted); font-style: italic;' : ''}">${fix.team1_name}</span>
            </div>
            ${winnerId && winnerId === fix.team1_id ? '<span style="color: var(--emerald); font-weight: 800;"></span>' : ''}
          </div>
          <div class="bracket-team-row ${winnerId && winnerId === fix.team2_id ? 'winner' : ''}">
            <div class="bracket-team-info">
              <span class="team-icon-sm" style="width: 20px; height: 20px; font-size: 10px; background: ${isTbd2 ? '#64748b' : (fix.team2_color || '#3b82f6')}">${isTbd2 ? '?' : (fix.team2_short || 'T2')}</span>
              <span style="${isTbd2 ? 'color: var(--ink-muted); font-style: italic;' : ''}">${fix.team2_name}</span>
            </div>
            ${winnerId && winnerId === fix.team2_id ? '<span style="color: var(--emerald); font-weight: 800;"></span>' : ''}
          </div>
          ${fix.result_text ? `<div class="bracket-advancement-badge" style="color: var(--emerald); font-weight: 600;">${fix.result_text}</div>` : (fix.next_fixture_id ? `<div class="bracket-advancement-badge">Winner advances to next round</div>` : '')}
        </div>
      `;
    });

    html += `</div>`;
  });
  html += `</div>`;

  container.innerHTML = html;
}

window.startMatchFromSchedule = function (fixtureId) {
  const fix = appState.tournament.fixtures.find((f) => f.id === fixtureId);
  if (!fix) return;

  if (String(fix.team1_id).startsWith('TBD') || String(fix.team2_id).startsWith('TBD')) {
    showToast('Teams for this match are not decided yet. Complete earlier round matches first!');
    return;
  }

  initMatchFromFixture(fix);
  switchView('scoreboard');
  renderAllViews();
  showToast(`Match loaded: ${fix.team1_name} vs ${fix.team2_name}`);
};

function renderTeamsView() {
  const tour = appState.tournament;
  if (!tour || !tour.teams) return;

  const pills = document.querySelector('#teamPills');
  if (!pills) return;
  pills.innerHTML = '';

  if (!appState.selectedTeamTabId && tour.teams.length > 0) {
    appState.selectedTeamTabId = tour.teams[0].id;
  }

  tour.teams.forEach((t) => {
    const btn = document.createElement('button');
    btn.className = `team-pill-btn ${t.id === appState.selectedTeamTabId ? 'active' : ''}`;
    btn.innerHTML = `<span class="team-icon-sm" style="background: ${t.color}">${t.short_name}</span> ${t.name}`;
    btn.onclick = () => {
      appState.selectedTeamTabId = t.id;
      renderTeamsView();
    };
    pills.appendChild(btn);
  });

  const selectedTeam = tour.teams.find((t) => t.id === appState.selectedTeamTabId) || tour.teams[0];
  if (!selectedTeam) return;

  const cap = selectedTeam.players.find((p) => p.is_captain);
  const vc = selectedTeam.players.find((p) => p.is_vice_captain);

  const bigBadge = document.querySelector('#teamBigBadge');
  if (bigBadge) {
    bigBadge.textContent = selectedTeam.short_name;
    bigBadge.style.background = selectedTeam.color || '#ed6a4e';
  }
  const bigName = document.querySelector('#teamBigName');
  if (bigName) bigName.textContent = selectedTeam.name;
  
  const bigInfo = document.querySelector('#teamBigInfo');
  if (bigInfo) {
    let leaderStr = `${selectedTeam.players.length} Players in Squad`;
    if (cap) leaderStr += ` •  Captain: ${cap.name}`;
    if (vc) leaderStr += ` •  VC: ${vc.name}`;
    bigInfo.textContent = leaderStr;
  }

  const cardsContainer = document.querySelector('#playerGridCards');
  if (!cardsContainer) return;
  cardsContainer.innerHTML = '';

  selectedTeam.players.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'player-stat-card';
    const initials = p.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    const avg = (p.matches > 0 && p.runs > 0) ? (p.runs / Math.max(1, p.matches)).toFixed(1) : '0.0';
    const sr = (p.balls_faced > 0) ? ((p.runs / p.balls_faced) * 100).toFixed(1) : '0.0';
    const econ = (p.balls_bowled > 0) ? (p.runs_conceded / (p.balls_bowled / 6)).toFixed(2) : '0.00';

    card.innerHTML = `
      <div class="player-stat-card-head">
        <div class="player-initials dark" style="width: 40px; height: 40px; font-size: 13px; margin: 0;">${initials}</div>
        <div>
          <strong>${formatPlayerName(p)}</strong>
          <span class="player-role-tag">${p.role || 'Batter'}</span>
        </div>
      </div>
      <div class="player-stats-grid">
        <div><span>Runs</span><strong>${p.runs || 0}</strong></div>
        <div><span>Avg</span><strong>${avg}</strong></div>
        <div><span>SR</span><strong>${sr}</strong></div>
        <div><span>Wickets</span><strong>${p.wickets || 0}</strong></div>
        <div><span>Econ</span><strong>${econ}</strong></div>
        <div><span>HS</span><strong>${p.high_score || 0}</strong></div>
      </div>
    `;
    cardsContainer.appendChild(card);
  });
}

function renderLeaderboardsView() {
  const tour = appState.tournament;
  if (!tour || !tour.teams) return;

  const allPlayers = [];
  tour.teams.forEach((t) => {
    t.players.forEach((p) => {
      const runs = p.runs || 0;
      const ballsFaced = p.balls_faced || 0;
      const wickets = p.wickets || 0;
      const ballsBowled = p.balls_bowled || 0;
      const runsConceded = p.runs_conceded || 0;
      const sr = ballsFaced > 0 ? (runs / ballsFaced) * 100 : 0;
      const econ = ballsBowled > 0 ? runsConceded / (ballsBowled / 6) : 0;
      
      // Tournament MVP Impact Points: runs + wickets*25 + SR bonus + Economy bonus
      let impactPoints = runs * 1.0 + wickets * 25.0;
      if (ballsFaced >= 6 && sr > 120) impactPoints += (sr - 120) * 0.25;
      if (ballsBowled >= 6 && econ < 8.0) impactPoints += (8.0 - econ) * 5.0;

      allPlayers.push({
        ...p,
        team_name: t.name,
        team_short: t.short_name,
        team_color: t.color,
        runs,
        balls_faced: ballsFaced,
        wickets,
        balls_bowled: ballsBowled,
        runs_conceded: runsConceded,
        sr: Number(sr.toFixed(1)),
        econ: Number(econ.toFixed(2)),
        impact_points: Math.round(impactPoints)
      });
    });
  });

  // 1. MAN OF THE SERIES / TOURNAMENT MVP
  const motsSorted = [...allPlayers].sort((a, b) => b.impact_points - a.impact_points || b.runs - a.runs || b.wickets - a.wickets);
  const topMvp = motsSorted[0] || { name: 'Arjun Mehta', runs: 0, wickets: 0, sr: 0.0, econ: 0.0, impact_points: 0, team_name: 'Team' };

  const motsName = document.querySelector('#motsPlayerName');
  if (motsName) motsName.innerHTML = formatPlayerName(topMvp);
  const motsTeam = document.querySelector('#motsPlayerTeam');
  if (motsTeam) motsTeam.textContent = `${topMvp.team_name} • ${topMvp.role || 'All-Rounder'}`;
  const motsInit = document.querySelector('#motsPlayerInitials');
  if (motsInit) motsInit.textContent = topMvp.name.substring(0, 2).toUpperCase();

  const mRuns = document.querySelector('#motsStatRuns');
  if (mRuns) mRuns.textContent = topMvp.runs;
  const mWkts = document.querySelector('#motsStatWickets');
  if (mWkts) mWkts.textContent = topMvp.wickets;
  const mSR = document.querySelector('#motsStatSR');
  if (mSR) mSR.textContent = topMvp.sr.toFixed(1);
  const mEcon = document.querySelector('#motsStatEcon');
  if (mEcon) mEcon.textContent = topMvp.econ.toFixed(2);
  const mImpact = document.querySelector('#motsStatImpact');
  if (mImpact) mImpact.textContent = topMvp.impact_points;

  // 2. ORANGE CAP (Leading Run Scorer)
  const orangeSorted = [...allPlayers].sort((a, b) => b.runs - a.runs || b.sr - a.sr);
  const topRun = orangeSorted[0] || { name: 'Arjun Mehta', runs: 0, team_name: 'Team' };
  
  const oName = document.querySelector('#orangeCapName');
  if (oName) oName.innerHTML = formatPlayerName(topRun);
  const oTeam = document.querySelector('#orangeCapTeam');
  if (oTeam) oTeam.textContent = topRun.team_name;
  const oRuns = document.querySelector('#orangeCapRuns');
  if (oRuns) oRuns.textContent = topRun.runs;
  const oInit = document.querySelector('#orangeCapInitials');
  if (oInit) oInit.textContent = topRun.name.substring(0, 2).toUpperCase();

  const orangeTbody = document.querySelector('#orangeCapTable tbody');
  if (orangeTbody) {
    orangeTbody.innerHTML = '';
    orangeSorted.slice(0, 5).forEach((p) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${formatPlayerName(p)}</strong></td><td>${p.team_short}</td><td class="text-right font-display">${p.runs}</td><td class="text-right">${p.sr.toFixed(1)}</td>`;
      orangeTbody.appendChild(tr);
    });
  }

  // 3. PURPLE CAP (Leading Wicket Taker)
  const purpleSorted = [...allPlayers].sort((a, b) => b.wickets - a.wickets || a.econ - b.econ);
  const topWkt = purpleSorted[0] || { name: 'Dev Malhotra', wickets: 0, team_name: 'Team' };
  
  const pName = document.querySelector('#purpleCapName');
  if (pName) pName.innerHTML = formatPlayerName(topWkt);
  const pTeam = document.querySelector('#purpleCapTeam');
  if (pTeam) pTeam.textContent = topWkt.team_name;
  const pWkts = document.querySelector('#purpleCapWickets');
  if (pWkts) pWkts.textContent = topWkt.wickets;
  const pInit = document.querySelector('#purpleCapInitials');
  if (pInit) pInit.textContent = topWkt.name.substring(0, 2).toUpperCase();

  const purpleTbody = document.querySelector('#purpleCapTable tbody');
  if (purpleTbody) {
    purpleTbody.innerHTML = '';
    purpleSorted.slice(0, 5).forEach((p) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${formatPlayerName(p)}</strong></td><td>${p.team_short}</td><td class="text-right font-display">${p.wickets}</td><td class="text-right">${p.econ.toFixed(2)}</td>`;
      purpleTbody.appendChild(tr);
    });
  }

  // 3. MOST SIXES (Maximums)
  const sixesSorted = [...allPlayers].sort((a, b) => (b.sixes || 0) - (a.sixes || 0) || (b.runs || 0) - (a.runs || 0));
  const topSixes = sixesSorted[0] || { name: 'Arjun Mehta', sixes: 0, runs: 0, team_name: 'Team' };

  const sixesName = document.querySelector('#mostSixesName');
  if (sixesName) sixesName.innerHTML = formatPlayerName(topSixes);
  const sixesTeam = document.querySelector('#mostSixesTeam');
  if (sixesTeam) sixesTeam.textContent = topSixes.team_name;
  const sixesStat = document.querySelector('#mostSixesStat');
  if (sixesStat) sixesStat.textContent = topSixes.sixes || 0;
  const sixesInit = document.querySelector('#mostSixesInitials');
  if (sixesInit) sixesInit.textContent = topSixes.name.substring(0, 2).toUpperCase();

  const sixesTbody = document.querySelector('#mostSixesTable tbody');
  if (sixesTbody) {
    sixesTbody.innerHTML = '';
    sixesSorted.slice(0, 5).forEach((p) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${formatPlayerName(p)}</strong></td><td>${p.team_short}</td><td class="text-right font-display" style="color: #ec4899;">${p.sixes || 0}</td><td class="text-right">${p.runs || 0}</td>`;
      sixesTbody.appendChild(tr);
    });
  }

  // 4. MOST FOURS (Boundaries)
  const foursSorted = [...allPlayers].sort((a, b) => (b.fours || 0) - (a.fours || 0) || (b.runs || 0) - (a.runs || 0));
  const topFours = foursSorted[0] || { name: 'Rohan Kapoor', fours: 0, runs: 0, team_name: 'Team' };

  const foursName = document.querySelector('#mostFoursName');
  if (foursName) foursName.innerHTML = formatPlayerName(topFours);
  const foursTeam = document.querySelector('#mostFoursTeam');
  if (foursTeam) foursTeam.textContent = topFours.team_name;
  const foursStat = document.querySelector('#mostFoursStat');
  if (foursStat) foursStat.textContent = topFours.fours || 0;
  const foursInit = document.querySelector('#mostFoursInitials');
  if (foursInit) foursInit.textContent = topFours.name.substring(0, 2).toUpperCase();

  const foursTbody = document.querySelector('#mostFoursTable tbody');
  if (foursTbody) {
    foursTbody.innerHTML = '';
    foursSorted.slice(0, 5).forEach((p) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${formatPlayerName(p)}</strong></td><td>${p.team_short}</td><td class="text-right font-display" style="color: #f97316;">${p.fours || 0}</td><td class="text-right">${p.runs || 0}</td>`;
      foursTbody.appendChild(tr);
    });
  }

  // 4. BEST BATTING STRIKE RATE
  const srSorted = [...allPlayers].filter((p) => p.balls_faced > 0).sort((a, b) => b.sr - a.sr || b.runs - a.runs);
  const topSR = srSorted[0] || { name: 'Rohan Kapoor', sr: 0.0, runs: 0, balls_faced: 0, team_name: 'Team' };

  const srName = document.querySelector('#bestSRName');
  if (srName) srName.innerHTML = formatPlayerName(topSR);
  const srTeam = document.querySelector('#bestSRTeam');
  if (srTeam) srTeam.textContent = topSR.team_name;
  const srStat = document.querySelector('#bestSRStat');
  if (srStat) srStat.textContent = topSR.sr.toFixed(1);
  const srInit = document.querySelector('#bestSRInitials');
  if (srInit) srInit.textContent = topSR.name.substring(0, 2).toUpperCase();

  const srTbody = document.querySelector('#bestSRTable tbody');
  if (srTbody) {
    srTbody.innerHTML = '';
    (srSorted.length > 0 ? srSorted : allPlayers).slice(0, 5).forEach((p) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${formatPlayerName(p)}</strong></td><td>${p.team_short}</td><td class="text-right font-display" style="color: #06b6d4;">${p.sr.toFixed(1)}</td><td class="text-right">${p.runs} (${p.balls_faced}b)</td>`;
      srTbody.appendChild(tr);
    });
  }

  // 5. BEST BOWLING ECONOMY
  const econSorted = [...allPlayers].filter((p) => p.balls_bowled > 0).sort((a, b) => a.econ - b.econ || b.wickets - a.wickets);
  const topEcon = econSorted[0] || { name: 'Vikram Rao', econ: 0.0, wickets: 0, balls_bowled: 0, team_name: 'Team' };

  const econName = document.querySelector('#bestEconName');
  if (econName) econName.innerHTML = formatPlayerName(topEcon);
  const econTeam = document.querySelector('#bestEconTeam');
  if (econTeam) econTeam.textContent = topEcon.team_name;
  const econStat = document.querySelector('#bestEconStat');
  if (econStat) econStat.textContent = topEcon.econ.toFixed(2);
  const econInit = document.querySelector('#bestEconInitials');
  if (econInit) econInit.textContent = topEcon.name.substring(0, 2).toUpperCase();

  const econTbody = document.querySelector('#bestEconTable tbody');
  if (econTbody) {
    econTbody.innerHTML = '';
    (econSorted.length > 0 ? econSorted : allPlayers).slice(0, 5).forEach((p) => {
      const oversText = `${Math.floor(p.balls_bowled / 6)}.${p.balls_bowled % 6}`;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>${formatPlayerName(p)}</strong></td><td>${p.team_short}</td><td class="text-right font-display" style="color: #10b981;">${p.econ.toFixed(2)}</td><td class="text-right">${p.wickets} (${oversText} ov)</td>`;
      econTbody.appendChild(tr);
    });
  }
}

function renderSummaryView() {
  const match = appState.activeMatch;
  if (!match) return;

  const resultTitle = document.querySelector('#summaryResultTitle');
  const resultDetail = document.querySelector('#summaryResultDetail');

  if (resultTitle && resultDetail) {
    if (match.is_match_completed) {
      resultTitle.textContent = match.result_text || 'Match Concluded';
      resultDetail.textContent = `Completed in ${match.overs_limit} overs per side. Points Table updated.`;
    } else {
      resultTitle.textContent = 'Match In Progress';
      resultDetail.textContent = `Currently in ${match.current_innings === 1 ? '1st' : '2nd'} innings.`;
    }
  }

  const awards = match.awards || {
    potm: { name: 'Arjun Mehta', runs: 68, balls: 43, team_name: match.team1.name, role: 'Batter', is_captain: true },
    best_batsman: { name: 'Arjun Mehta', runs: 68, balls: 43, team_name: match.team1.name },
    best_bowler: { name: 'Dev Malhotra', wickets: 1, runs_conceded: 26, team_name: match.team2.name }
  };

  const potm = awards.potm;
  const potmName = document.querySelector('#potmName');
  if (potmName) potmName.innerHTML = formatPlayerName(potm);
  const potmTeam = document.querySelector('#potmTeam');
  if (potmTeam) potmTeam.textContent = potm.team_name || 'Team';
  const potmRole = document.querySelector('#potmRole');
  if (potmRole) potmRole.textContent = potm.role || 'Player';
  const potmStat = document.querySelector('#potmMainStat');
  if (potmStat) potmStat.innerHTML = `${potm.runs || 0} <small>runs off ${potm.balls || 0} balls</small>`;
  const potmInit = document.querySelector('#potmInitials');
  if (potmInit) potmInit.textContent = potm.name.substring(0, 2).toUpperCase();

  const bestBat = awards.best_batsman;
  const bbName = document.querySelector('#bestBatName');
  if (bbName) bbName.innerHTML = formatPlayerName(bestBat);
  const bbTeam = document.querySelector('#bestBatTeam');
  if (bbTeam) bbTeam.textContent = bestBat.team_name || 'Team';
  const bbStat = document.querySelector('#bestBatStat');
  if (bbStat) bbStat.innerHTML = `${bestBat.runs || 0} <small>runs (${bestBat.balls || 0}b)</small>`;
  const bbInit = document.querySelector('#bestBatInitials');
  if (bbInit) bbInit.textContent = bestBat.name.substring(0, 2).toUpperCase();

  const bestBowl = awards.best_bowler;
  const bblName = document.querySelector('#bestBowlName');
  if (bblName) bblName.innerHTML = formatPlayerName(bestBowl);
  const bblTeam = document.querySelector('#bestBowlTeam');
  if (bblTeam) bblTeam.textContent = bestBowl.team_name || 'Team';
  const bblStat = document.querySelector('#bestBowlStat');
  if (bblStat) bblStat.innerHTML = `${bestBowl.wickets || 0}/${bestBowl.runs_conceded || 0} <small>bowling</small>`;
  const bblInit = document.querySelector('#bestBowlInitials');
  if (bblInit) bblInit.textContent = bestBowl.name.substring(0, 2).toUpperCase();

  // Match Best Strike Rate
  const allMatchBatters = [
    ...(match.innings1?.batters || []).map((b) => ({ ...b, team: match.innings1.batting_team_name })),
    ...(match.innings2?.batters || []).map((b) => ({ ...b, team: match.innings2.batting_team_name }))
  ].filter((b) => (b.balls || 0) > 0);

  let bestSRBatter = allMatchBatters.sort((a, b) => ((b.runs || 0) / b.balls) - ((a.runs || 0) / a.balls) || (b.runs || 0) - (a.runs || 0))[0] || { name: bestBat.name, runs: bestBat.runs, balls: bestBat.balls, team: bestBat.team_name };
  const mSRVal = bestSRBatter.balls > 0 ? ((bestSRBatter.runs / bestSRBatter.balls) * 100).toFixed(1) : '0.0';

  const mSRName = document.querySelector('#matchBestSRName');
  if (mSRName) mSRName.innerHTML = formatPlayerName(bestSRBatter);
  const mSRTeam = document.querySelector('#matchBestSRTeam');
  if (mSRTeam) mSRTeam.textContent = bestSRBatter.team || match.team1.name;
  const mSRStat = document.querySelector('#matchBestSRStat');
  if (mSRStat) mSRStat.innerHTML = `${mSRVal} <small>SR</small>`;
  const mSRMeta = document.querySelector('#matchBestSRMeta');
  if (mSRMeta) mSRMeta.textContent = `${bestSRBatter.runs || 0} runs off ${bestSRBatter.balls || 0} balls`;
  const mSRInit = document.querySelector('#matchBestSRInitials');
  if (mSRInit) mSRInit.textContent = (bestSRBatter.name || 'RK').substring(0, 2).toUpperCase();

  // Match Best Bowling Economy
  const allMatchBowlers = [
    ...(match.innings1?.bowlers || []).map((b) => ({ ...b, team: match.innings1.bowling_team_name })),
    ...(match.innings2?.bowlers || []).map((b) => ({ ...b, team: match.innings2.bowling_team_name }))
  ].filter((b) => (b.balls || 0) > 0);

  let bestEconBowler = allMatchBowlers.sort((a, b) => ((a.runs || 0) / (a.balls / 6)) - ((b.runs || 0) / (b.balls / 6)) || (b.wickets || 0) - (a.wickets || 0))[0] || { name: bestBowl.name, wickets: bestBowl.wickets, runs: bestBowl.runs_conceded, balls: 24, team: bestBowl.team_name };
  const mEconVal = bestEconBowler.balls > 0 ? ((bestEconBowler.runs / (bestEconBowler.balls / 6))).toFixed(2) : '0.00';
  const ovStr = `${Math.floor((bestEconBowler.balls || 0) / 6)}.${(bestEconBowler.balls || 0) % 6}`;

  const mEconName = document.querySelector('#matchBestEconName');
  if (mEconName) mEconName.innerHTML = formatPlayerName(bestEconBowler);
  const mEconTeam = document.querySelector('#matchBestEconTeam');
  if (mEconTeam) mEconTeam.textContent = bestEconBowler.team || match.team2.name;
  const mEconStat = document.querySelector('#matchBestEconStat');
  if (mEconStat) mEconStat.innerHTML = `${mEconVal} <small>Econ</small>`;
  const mEconMeta = document.querySelector('#matchBestEconMeta');
  if (mEconMeta) mEconMeta.textContent = `${bestEconBowler.wickets || 0}/${bestEconBowler.runs || 0} in ${ovStr} overs`;
  const mEconInit = document.querySelector('#matchBestEconInitials');
  if (mEconInit) mEconInit.textContent = (bestEconBowler.name || 'VR').substring(0, 2).toUpperCase();

  const inn1 = match.innings1;
  const inn2 = match.innings2;
  const maxOvers = match.overs_limit || 20;

  const s1Name = document.querySelector('#summaryTeam1Name');
  if (s1Name) s1Name.textContent = inn1.batting_team_name;
  const s1Score = document.querySelector('#summaryTeam1Score');
  if (s1Score) s1Score.textContent = `${inn1.runs}/${inn1.wickets} (${Math.floor(inn1.balls / 6)}.${inn1.balls % 6})`;
  const p1 = Math.min(100, (inn1.balls / (maxOvers * 6)) * 100);
  const s1Prog = document.querySelector('#summaryTeam1Progress');
  if (s1Prog) s1Prog.style.width = `${p1}%`;

  const s2Name = document.querySelector('#summaryTeam2Name');
  if (s2Name) s2Name.textContent = inn2.batting_team_name;
  const s2Score = document.querySelector('#summaryTeam2Score');
  if (s2Score) s2Score.textContent = `${inn2.runs}/${inn2.wickets} (${Math.floor(inn2.balls / 6)}.${inn2.balls % 6})`;
  const p2 = Math.min(100, (inn2.balls / (maxOvers * 6)) * 100);
  const s2Prog = document.querySelector('#summaryTeam2Progress');
  if (s2Prog) s2Prog.style.width = `${p2}%`;
}

// ----------------------------------------------------
// EXTRA RUNS MODAL (Wide, No Ball, Leg Bye, Bye)
// ----------------------------------------------------

function openExtraRunsModal(extraType) {
  const modal = document.querySelector('#extraRunsModal');
  const badge = document.querySelector('#extraModalBadge');
  const title = document.querySelector('#extraModalTitle');
  const sub = document.querySelector('#extraModalSubtitle');
  const container = document.querySelector('#extraRunsOptionsContainer');

  if (!modal || !container) return;

  container.innerHTML = '';

  if (extraType === 'WD') {
    if (badge) badge.textContent = 'WIDE BALL (WD)';
    if (title) title.textContent = 'Wide + Additional Runs?';
    if (sub) sub.textContent = '1 wide penalty + additional runs from running or overthrow/boundary';

    const options = [
      { runs: 0, label: '+0', desc: '1 Run (Just Wide)' },
      { runs: 1, label: '+1', desc: '2 Runs (1 Wide + 1 Ran)' },
      { runs: 2, label: '+2', desc: '3 Runs (1 Wide + 2 Ran)' },
      { runs: 3, label: '+3', desc: '4 Runs (1 Wide + 3 Ran)' },
      { runs: 4, label: '+4', desc: '5 Runs (Wide + 4 Boundary)' }
    ];

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline';
      btn.style.flexDirection = 'column';
      btn.style.padding = '10px 6px';
      btn.style.minHeight = '58px';
      btn.innerHTML = `<strong style="font-size: 17px; color: var(--gold);">${opt.label}</strong><small style="font-size: 10px; color: var(--ink-muted); margin-top: 3px;">${opt.desc}</small>`;
      btn.onclick = () => {
        closeExtraRunsModal();
        recordBall(opt.runs, 'WD');
      };
      container.appendChild(btn);
    });
  } else if (extraType === 'NB') {
    if (badge) badge.textContent = 'NO BALL (NB)';
    if (title) title.textContent = 'Runs off Bat / Running?';
    if (sub) sub.textContent = '1 no-ball penalty + runs scored by batsman off this delivery';

    const options = [
      { runs: 0, label: '+0', desc: '1 Run (No runs off bat)' },
      { runs: 1, label: '+1', desc: '2 Runs (1 off bat)' },
      { runs: 2, label: '+2', desc: '3 Runs (2 off bat)' },
      { runs: 3, label: '+3', desc: '4 Runs (3 off bat)' },
      { runs: 4, label: '+4', desc: '5 Runs (4 Boundary)' },
      { runs: 6, label: '+6', desc: '7 Runs (6 Six off bat)' }
    ];

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline';
      btn.style.flexDirection = 'column';
      btn.style.padding = '10px 6px';
      btn.style.minHeight = '58px';
      btn.innerHTML = `<strong style="font-size: 17px; color: var(--coral);">${opt.label}</strong><small style="font-size: 10px; color: var(--ink-muted); margin-top: 3px;">${opt.desc}</small>`;
      btn.onclick = () => {
        closeExtraRunsModal();
        recordBall(opt.runs, 'NB');
      };
      container.appendChild(btn);
    });
  } else if (extraType === 'LB') {
    if (badge) badge.textContent = 'LEG BYE (LB)';
    if (title) title.textContent = 'How many Leg Bye runs?';
    if (sub) sub.textContent = 'Runs completed off the batter\'s pads/body (legal delivery)';

    const options = [
      { runs: 1, label: '1 Run', desc: 'Single Leg Bye' },
      { runs: 2, label: '2 Runs', desc: 'Double Leg Bye' },
      { runs: 3, label: '3 Runs', desc: 'Three Leg Byes' },
      { runs: 4, label: '4 Runs', desc: 'Four (Boundary Leg Bye)' }
    ];

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline';
      btn.style.flexDirection = 'column';
      btn.style.padding = '10px 6px';
      btn.style.minHeight = '58px';
      btn.innerHTML = `<strong style="font-size: 17px; color: #06b6d4;">${opt.label}</strong><small style="font-size: 10px; color: var(--ink-muted); margin-top: 3px;">${opt.desc}</small>`;
      btn.onclick = () => {
        closeExtraRunsModal();
        recordBall(opt.runs, 'LB');
      };
      container.appendChild(btn);
    });
  } else if (extraType === 'B') {
    if (badge) badge.textContent = 'BYE (B)';
    if (title) title.textContent = 'How many Bye runs?';
    if (sub) sub.textContent = 'Runs completed without touching bat or body (legal delivery)';

    const options = [
      { runs: 1, label: '1 Run', desc: 'Single Bye' },
      { runs: 2, label: '2 Runs', desc: 'Double Bye' },
      { runs: 3, label: '3 Runs', desc: 'Three Byes' },
      { runs: 4, label: '4 Runs', desc: 'Four (Boundary Bye)' }
    ];

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-outline';
      btn.style.flexDirection = 'column';
      btn.style.padding = '10px 6px';
      btn.style.minHeight = '58px';
      btn.innerHTML = `<strong style="font-size: 17px; color: #10b981;">${opt.label}</strong><small style="font-size: 10px; color: var(--ink-muted); margin-top: 3px;">${opt.desc}</small>`;
      btn.onclick = () => {
        closeExtraRunsModal();
        recordBall(opt.runs, 'B');
      };
      container.appendChild(btn);
    });
  }

  modal.classList.add('show');
}

function closeExtraRunsModal() {
  const modal = document.querySelector('#extraRunsModal');
  if (modal) modal.classList.remove('show');
}

// ----------------------------------------------------
// EVENT LISTENERS SETUP
// ----------------------------------------------------

function setupEventListeners() {
  document.querySelectorAll('.nav-item[data-view]').forEach((btn) => {
    btn.onclick = () => switchView(btn.dataset.view);
  });

  document.querySelectorAll('[data-view-link]').forEach((link) => {
    link.onclick = () => switchView(link.dataset.viewLink);
  });

  document.querySelectorAll('[data-runs]').forEach((btn) => {
    btn.onclick = () => recordBall(Number(btn.dataset.runs));
  });

  document.querySelectorAll('[data-extra]').forEach((btn) => {
    btn.onclick = () => openExtraRunsModal(btn.dataset.extra);
  });

  const cancelExtraBtn = document.querySelector('#cancelExtraRunsBtn');
  if (cancelExtraBtn) cancelExtraBtn.onclick = () => closeExtraRunsModal();

  const wktBtn = document.querySelector('[data-wicket]');
  if (wktBtn) wktBtn.onclick = () => openWicketModal('Caught');

  const roBtn = document.querySelector('[data-runout]');
  if (roBtn) roBtn.onclick = () => openWicketModal('Run Out');

  const undoBtn = document.querySelector('#undoButton');
  if (undoBtn) undoBtn.onclick = () => undoLastBall();

  const swapBtn = document.querySelector('#swapStrikeBtn');
  if (swapBtn) swapBtn.onclick = () => swapStrike(true);

  const tInn1 = document.querySelector('#tabInn1');
  if (tInn1) {
    tInn1.onclick = () => {
      tInn1.classList.add('active');
      document.querySelector('#tabInn2')?.classList.remove('active');
      const b1 = document.querySelector('#innings1ScorecardBlock');
      if (b1) b1.style.display = 'block';
      const b2 = document.querySelector('#innings2ScorecardBlock');
      if (b2) b2.style.display = 'none';
    };
  }

  const tInn2 = document.querySelector('#tabInn2');
  if (tInn2) {
    tInn2.onclick = () => {
      tInn2.classList.add('active');
      document.querySelector('#tabInn1')?.classList.remove('active');
      const b1 = document.querySelector('#innings1ScorecardBlock');
      if (b1) b1.style.display = 'none';
      const b2 = document.querySelector('#innings2ScorecardBlock');
      if (b2) b2.style.display = 'block';
    };
  }

  const swInnBtn = document.querySelector('#switchInningsBtn');
  if (swInnBtn) {
    swInnBtn.onclick = () => {
      const match = appState.activeMatch;
      if (!match) return;
      if (match.current_innings === 1) {
        match.innings1.is_completed = true;
        match.target = match.innings1.runs + 1;
        match.current_innings = 2;
        showToast(`Switched to 2nd Innings! Target: ${match.target} runs`);
      } else {
        match.innings2.is_completed = true;
        match.is_match_completed = true;
        checkMatchProgress();
      }
      saveToLocalStorage();
      renderAllViews();
    };
  }

  const resetBtn = document.querySelector('#resetMatchBtn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm('Reset this current match score to 0?')) {
        const match = appState.activeMatch;
        if (match) {
          appState.activeMatch = createNewMatchState(match.team1, match.team2, match.overs_limit, match.fixture_id);
          saveToLocalStorage();
          renderAllViews();
          showToast('Match reset to 0');
        }
      }
    };
  }

  const themeBtn = document.querySelector('#themeToggleBtn');
  if (themeBtn) {
    const savedTheme = localStorage.getItem('scorewizz_theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      themeBtn.textContent = 'Light';
    } else {
      document.body.classList.remove('dark-theme');
      themeBtn.textContent = 'Dark';
    }

    themeBtn.onclick = () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      themeBtn.textContent = isDark ? 'Light' : 'Dark';
      localStorage.setItem('scorewizz_theme', isDark ? 'dark' : 'light');
      showToast(isDark ? 'Dark Theme activated' : 'Light Theme activated');
    };
  }

  // Wizard Step 1: Quick Presets
  document.querySelectorAll('.quick-overs-btn').forEach((btn) => {
    btn.onclick = () => {
      const input = document.querySelector('#wizTourOvers');
      if (input && btn.dataset.overs) {
        input.value = btn.dataset.overs;
        document.querySelectorAll('.quick-overs-btn').forEach((b) => b.classList.remove('btn-primary'));
        btn.classList.add('btn-primary');
      }
    };
  });

  document.querySelectorAll('.quick-teams-btn').forEach((btn) => {
    btn.onclick = () => {
      const input = document.querySelector('#wizTourNumTeams');
      if (input && btn.dataset.teams) {
        input.value = btn.dataset.teams;
        document.querySelectorAll('.quick-teams-btn').forEach((b) => b.classList.remove('btn-primary'));
        btn.classList.add('btn-primary');
      }
    };
  });

  // Wizard Step Badges (Direct Click Navigation)
  document.querySelectorAll('.step-badge[data-step]').forEach((badge) => {
    badge.onclick = () => {
      const targetStep = Number(badge.dataset.step);
      if (appState.wizardStep === 1) {
        appState.wizardData.name = document.querySelector('#wizTourName')?.value?.trim() || 'Premier League 2026';
        appState.wizardData.overs = Math.max(1, Number(document.querySelector('#wizTourOvers')?.value) || 20);
        appState.wizardData.numTeams = Math.max(2, Number(document.querySelector('#wizTourNumTeams')?.value) || 4);
      } else if (appState.wizardStep === 2) {
        saveWizardTeamsFromUI();
      } else if (appState.wizardStep === 3) {
        saveCurrentTeamSquad(false);
      }
      appState.wizardStep = targetStep;
      updateWizardUI();
    };
  });

  const openWiz = document.querySelector('#openWizardBtn');
  if (openWiz) openWiz.onclick = () => openTournamentWizard();

  const closeWiz = document.querySelector('#closeWizardBtn');
  if (closeWiz) closeWiz.onclick = () => closeTournamentWizard();

  const toggleWizFs = document.querySelector('#toggleWizardFullscreenBtn');
  const wizModalCard = document.querySelector('#tournamentWizardModal .modal-card');
  if (toggleWizFs && wizModalCard) {
    toggleWizFs.onclick = () => {
      const isFs = wizModalCard.classList.toggle('is-fullscreen');
      toggleWizFs.textContent = isFs ? '[=]' : '[ ]';
      toggleWizFs.title = isFs ? 'Restore Normal Window' : 'Maximize / Fullscreen View';
    };
  }

  const nextWiz = document.querySelector('#wizNextBtn');
  if (nextWiz) nextWiz.onclick = () => handleWizardNext();

  const backWiz = document.querySelector('#wizBackBtn');
  if (backWiz) backWiz.onclick = () => handleWizardBack();

  const launchWiz = document.querySelector('#wizLaunchBtn');
  if (launchWiz) launchWiz.onclick = () => handleWizardLaunch();

  const qfTeams = document.querySelector('#wizQuickFillTeamsBtn');
  if (qfTeams) qfTeams.onclick = () => quickFillWizardTeams();

  const qfPlayers = document.querySelector('#wizQuickFillPlayersBtn');
  if (qfPlayers) qfPlayers.onclick = () => quickFillWizardPlayers();

  // Wizard Step 3 buttons
  const addPlayerBtn = document.querySelector('#wizAddPlayerBtn');
  if (addPlayerBtn) addPlayerBtn.onclick = () => addPlayerToActiveTeam();

  const saveCurrentTeamBtn = document.querySelector('#wizSaveCurrentTeamBtn');
  if (saveCurrentTeamBtn) saveCurrentTeamBtn.onclick = () => saveCurrentTeamSquad(true);

  const saveCurrentTeamBottomBtn = document.querySelector('#wizSaveCurrentTeamBottomBtn');
  if (saveCurrentTeamBottomBtn) saveCurrentTeamBottomBtn.onclick = () => saveCurrentTeamSquad(true);

  // Teams View Edit Squad Button
  const openEditSquadModalBtn = document.querySelector('#openEditSquadModalBtn');
  if (openEditSquadModalBtn) {
    openEditSquadModalBtn.onclick = () => {
      const activeTeamId = appState.selectedTeamTabId || appState.tournament?.teams?.[0]?.id;
      if (activeTeamId) openEditSquadModal(activeTeamId);
    };
  }

  // Edit Squad Modal buttons
  const closeEditSquadBtn = document.querySelector('#closeEditSquadModalBtn');
  if (closeEditSquadBtn) closeEditSquadBtn.onclick = () => closeEditSquadModal();

  const cancelEditSquadBtn = document.querySelector('#cancelEditSquadBtn');
  if (cancelEditSquadBtn) cancelEditSquadBtn.onclick = () => closeEditSquadModal();

  const editSquadAddPlayerBtn = document.querySelector('#editSquadAddPlayerBtn');
  if (editSquadAddPlayerBtn) editSquadAddPlayerBtn.onclick = () => addPlayerToEditSquad();

  const saveEditSquadBtn = document.querySelector('#saveEditSquadBtn');
  if (saveEditSquadBtn) saveEditSquadBtn.onclick = () => saveEditedSquad();

  // Wizard Schedule Toggle
  document.querySelectorAll('input[name="scheduleType"]').forEach((radio) => {
    radio.onchange = (e) => {
      document.querySelectorAll('.schedule-option').forEach((opt) => opt.classList.remove('active'));
      e.target.closest('.schedule-option')?.classList.add('active');
      const val = e.target.value;
      const manArea = document.querySelector('#wizManualScheduleArea');
      const autoConfig = document.querySelector('#wizAutoRoundsConfig');
      if (manArea) manArea.style.display = val === 'manual' ? 'block' : 'none';
      if (autoConfig) autoConfig.style.display = val === 'auto' ? 'block' : 'none';
      if (val === 'manual') renderWizardManualMatchesList();
    };
  });

  const addManBtn = document.querySelector('#wizAddManualMatchBtn');
  if (addManBtn) addManBtn.onclick = () => addWizardManualMatch();

  // Batsman Selection Modal & Crease Actions
  const selectBatsmenBtn = document.querySelector('#selectBatsmenBtn');
  if (selectBatsmenBtn) selectBatsmenBtn.onclick = () => openBatsmanModal();

  const strikerRow = document.querySelector('#strikerRow');
  if (strikerRow) {
    strikerRow.style.cursor = 'pointer';
    strikerRow.title = 'Click to change batsmen at crease';
    strikerRow.onclick = () => openBatsmanModal();
  }

  const nonStrikerRow = document.querySelector('#nonStrikerRow');
  if (nonStrikerRow) {
    nonStrikerRow.style.cursor = 'pointer';
    nonStrikerRow.title = 'Click to change batsmen at crease';
    nonStrikerRow.onclick = () => openBatsmanModal();
  }

  const swapStrikeCreaseBtn = document.querySelector('#swapStrikeCreaseBtn');
  if (swapStrikeCreaseBtn) swapStrikeCreaseBtn.onclick = () => swapStrike(true);

  const closeBatsmanModalBtn = document.querySelector('#closeBatsmanModalBtn');
  if (closeBatsmanModalBtn) closeBatsmanModalBtn.onclick = () => closeBatsmanModal();

  const cancelBatsmanModalBtn = document.querySelector('#cancelBatsmanModalBtn');
  if (cancelBatsmanModalBtn) cancelBatsmanModalBtn.onclick = () => closeBatsmanModal();

  const confirmBatsmanModalBtn = document.querySelector('#confirmBatsmanModalBtn');
  if (confirmBatsmanModalBtn) confirmBatsmanModalBtn.onclick = () => handleConfirmBatsmen();

  // Wicket Modal
  const closeWkt = document.querySelector('#closeWicketModalBtn');
  if (closeWkt) closeWkt.onclick = () => closeWicketModal();

  const cancelWkt = document.querySelector('#cancelWicketBtn');
  if (cancelWkt) cancelWkt.onclick = () => closeWicketModal();

  const confWkt = document.querySelector('#confirmWicketBtn');
  if (confWkt) confWkt.onclick = () => handleConfirmWicket();

  // Bowler Modal
  const closeBowl = document.querySelector('#closeBowlerModalBtn');
  if (closeBowl) closeBowl.onclick = () => closeBowlerModal();

  const changeBowl = document.querySelector('#changeBowlerBtn');
  if (changeBowl) changeBowl.onclick = () => openBowlerModal();

  const confBowl = document.querySelector('#confirmBowlerBtn');
  if (confBowl) confBowl.onclick = () => handleConfirmBowler();

  // Victory Modal
  const vScore = document.querySelector('#viewFullScorecardBtn');
  if (vScore) {
    vScore.onclick = () => {
      closeVictoryModal();
      switchView('scorecard');
    };
  }

  const vPt = document.querySelector('#viewPointsTableBtn');
  if (vPt) {
    vPt.onclick = () => {
      closeVictoryModal();
      switchView('pointsTable');
    };
  }

  const closeVicBtn = document.querySelector('#closeVictoryModalBtn');
  if (closeVicBtn) closeVicBtn.onclick = () => closeVictoryModal();

  // Tie-Breaker Modal Buttons
  const startSOBtn = document.querySelector('#startSuperOverBtn');
  if (startSOBtn) startSOBtn.onclick = () => startSuperOver();

  const decideBoundBtn = document.querySelector('#decideByBoundariesBtn');
  if (decideBoundBtn) decideBoundBtn.onclick = () => decideWinnerByBoundaries();

  const accTieBtn = document.querySelector('#acceptTieBtn');
  if (accTieBtn) accTieBtn.onclick = () => acceptMatchTied();

  // Scoreboard Completed Summary Action Buttons
  const sbScoreBtn = document.querySelector('#sbViewScorecardBtn');
  if (sbScoreBtn) sbScoreBtn.onclick = () => switchView('scorecard');

  const sbPtBtn = document.querySelector('#sbViewPointsTableBtn');
  if (sbPtBtn) sbPtBtn.onclick = () => switchView('pointsTable');

  const sbExpBtn = document.querySelector('#sbExportScorecardBtn');
  if (sbExpBtn) sbExpBtn.onclick = () => exportScorecard();

  const expBtn = document.querySelector('#exportMatchBtn');
  if (expBtn) expBtn.onclick = () => exportScorecard();

  const qmBtn = document.querySelector('#openQuickMatchBtn');
  if (qmBtn) qmBtn.onclick = () => openQuickMatchModal();

  const closeQm = document.querySelector('#closeQuickMatchModalBtn');
  if (closeQm) closeQm.onclick = () => closeQuickMatchModal();

  const cancelQm = document.querySelector('#cancelQuickMatchBtn');
  if (cancelQm) cancelQm.onclick = () => closeQuickMatchModal();

  const startQm = document.querySelector('#startQuickMatchBtn');
  if (startQm) startQm.onclick = () => handleStartQuickMatch();

  // Fixtures View List vs Bracket Toggle
  const listToggleBtn = document.querySelector('#fixturesListToggleBtn');
  const bracketToggleBtn = document.querySelector('#fixturesBracketToggleBtn');
  const fixturesGrid = document.querySelector('#fixturesGrid');
  const bracketContainer = document.querySelector('#knockoutBracketContainer');

  if (listToggleBtn && bracketToggleBtn) {
    listToggleBtn.onclick = () => {
      listToggleBtn.className = 'btn btn-sm btn-primary';
      bracketToggleBtn.className = 'btn btn-sm btn-outline';
      if (fixturesGrid) fixturesGrid.style.display = 'grid';
      if (bracketContainer) bracketContainer.style.display = 'none';
    };

    bracketToggleBtn.onclick = () => {
      bracketToggleBtn.className = 'btn btn-sm btn-primary';
      listToggleBtn.className = 'btn btn-sm btn-outline';
      if (fixturesGrid) fixturesGrid.style.display = 'none';
      if (bracketContainer) {
        bracketContainer.style.display = 'block';
        renderKnockoutBracketTree('#knockoutBracketContainer', appState.tournament?.fixtures, appState.tournament?.teams);
      }
    };
  }

  // Wizard Step 4: Toggle Knockout Graph Preview
  const wizGraphToggle = document.querySelector('#wizToggleKnockoutGraphBtn');
  const wizGraphPreview = document.querySelector('#wizKnockoutGraphPreview');
  if (wizGraphToggle && wizGraphPreview) {
    wizGraphToggle.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = wizGraphPreview.style.display === 'none';
      wizGraphPreview.style.display = isHidden ? 'block' : 'none';
      wizGraphToggle.textContent = isHidden ? ' Hide Schedule Graph' : 'View Schedule Graph';
      if (isHidden) {
        const previewFixtures = generateKnockoutSchedule(appState.wizardData.teams, 'tour_preview');
        renderKnockoutBracketTree('#wizKnockoutGraphPreview', previewFixtures, appState.wizardData.teams);
      }
    };
  }

  const addFixBtn = document.querySelector('#openAddFixtureModalBtn');
  if (addFixBtn) {
    addFixBtn.onclick = () => {
      openTournamentWizard();
      appState.wizardStep = 4;
      updateWizardUI();
      const manOpt = document.querySelector('input[name="scheduleType"][value="manual"]');
      if (manOpt) {
        manOpt.checked = true;
        manOpt.dispatchEvent(new Event('change'));
      }
    };
  }

  // All Tournaments View controls
  const allTourCreateBtn = document.querySelector('#allTournamentsCreateBtn');
  if (allTourCreateBtn) allTourCreateBtn.onclick = () => openTournamentWizard();

  document.querySelectorAll('[data-tour-filter]').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('[data-tour-filter]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      appState.tournamentFilter = btn.dataset.tourFilter;
      renderAllTournamentsView();
    };
  });

  const searchTourInput = document.querySelector('#searchTournamentInput');
  if (searchTourInput) {
    searchTourInput.oninput = () => renderAllTournamentsView();
  }
}

function switchView(viewName) {
  appState.currentView = viewName;
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active-view'));
  const targetView = document.querySelector(`#${viewName}View`);
  if (targetView) targetView.classList.add('active-view');

  document.querySelectorAll('.nav-item[data-view]').forEach((nav) => {
    nav.classList.toggle('active', nav.dataset.view === viewName);
  });

  const titles = {
    scoreboard: 'Live Scoreboard',
    scorecard: 'Full Match Scorecard',
    pointsTable: 'Tournament Standings',
    fixtures: 'Schedule & Fixtures',
    teams: 'Teams & Player Cards',
    leaderboards: 'Tournament Leaderboards',
    summary: 'Match Summary & Awards',
    allTournaments: 'All Tournaments & Directory'
  };
  const pTitle = document.querySelector('#pageTitle');
  if (pTitle) pTitle.textContent = titles[viewName] || 'ScoreWizz';

  renderCurrentView();
}

function renderCurrentView() {
  const v = appState.currentView || 'scoreboard';
  if (v === 'scoreboard') renderScoreboardView();
  else if (v === 'scorecard') renderScorecardView();
  else if (v === 'pointsTable') renderPointsTableView();
  else if (v === 'fixtures') renderFixturesView();
  else if (v === 'teams') renderTeamsView();
  else if (v === 'leaderboards') renderLeaderboardsView();
  else if (v === 'summary') renderSummaryView();
  else if (v === 'allTournaments') renderAllTournamentsView();

  if (appState.tournament) {
    const badge = document.querySelector('#sidebarTournamentName');
    if (badge) badge.textContent = appState.tournament.name;
    const eyebrow = document.querySelector('#topbarEyebrow');
    if (eyebrow) eyebrow.textContent = appState.tournament.name;
  }
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ----------------------------------------------------
// TOURNAMENT SETUP WIZARD & SQUAD LOGIC (Min 11, Max 15)
// ----------------------------------------------------

function openTournamentWizard() {
  appState.wizardStep = 1;
  appState.activeWizardTeamIndex = 0;
  const modal = document.querySelector('#tournamentWizardModal');
  if (modal) modal.classList.add('show');

  const nameInput = document.querySelector('#wizTourName');
  if (nameInput) nameInput.value = appState.wizardData.name || 'Premier T20 Championship 2026';
  
  const oversInput = document.querySelector('#wizTourOvers');
  if (oversInput) oversInput.value = appState.wizardData.overs || 20;
  
  const teamsInput = document.querySelector('#wizTourNumTeams');
  if (teamsInput) teamsInput.value = appState.wizardData.numTeams || 4;

  updateWizardUI();
}

function closeTournamentWizard() {
  const modal = document.querySelector('#tournamentWizardModal');
  if (modal) modal.classList.remove('show');
}

function updateWizardUI() {
  document.querySelectorAll('.wizard-step').forEach((s) => s.classList.remove('active'));
  const currentStep = document.querySelector(`#wizardStep${appState.wizardStep}`);
  if (currentStep) currentStep.classList.add('active');

  document.querySelectorAll('.step-badge').forEach((b) => {
    b.classList.toggle('active', Number(b.dataset.step) === appState.wizardStep);
  });

  const backBtn = document.querySelector('#wizBackBtn');
  if (backBtn) backBtn.style.display = appState.wizardStep > 1 ? 'inline-flex' : 'none';
  
  const nextBtn = document.querySelector('#wizNextBtn');
  if (nextBtn) nextBtn.style.display = appState.wizardStep < 4 ? 'inline-flex' : 'none';
  
  const launchBtn = document.querySelector('#wizLaunchBtn');
  if (launchBtn) launchBtn.style.display = appState.wizardStep === 4 ? 'inline-flex' : 'none';

  if (appState.wizardStep === 2) buildWizardTeamsStep();
  if (appState.wizardStep === 3) buildWizardPlayersStep();
  if (appState.wizardStep === 4) buildWizardScheduleStep();
}

function handleWizardNext() {
  if (appState.wizardStep === 1) {
    appState.wizardData.name = document.querySelector('#wizTourName')?.value?.trim() || 'Premier League 2026';
    appState.wizardData.overs = Math.max(1, Number(document.querySelector('#wizTourOvers')?.value) || 20);
    appState.wizardData.numTeams = Math.max(2, Number(document.querySelector('#wizTourNumTeams')?.value) || 4);
  } else if (appState.wizardStep === 2) {
    saveWizardTeamsFromUI();
  } else if (appState.wizardStep === 3) {
    saveCurrentTeamSquad(false);

    const teams = appState.wizardData.teams;
    for (let i = 0; i < teams.length; i++) {
      const t = teams[i];
      const count = t.players ? t.players.length : 0;
      if (count < 11) {
        appState.activeWizardTeamIndex = i;
        buildWizardPlayersStep();
        showToast(`Please add at least 11 players for ${t.name} (Currently: ${count})`);
        return;
      }
    }
  }

  appState.wizardStep++;
  updateWizardUI();
}

function handleWizardBack() {
  if (appState.wizardStep === 3) {
    saveCurrentTeamSquad(false);
  }
  appState.wizardStep--;
  updateWizardUI();
}

function buildWizardTeamsStep() {
  const container = document.querySelector('#wizTeamsContainer');
  if (!container) return;
  container.innerHTML = '';
  const num = appState.wizardData.numTeams;

  if (appState.wizardData.teams.length !== num) {
    const teams = [];
    const colors = ['#ed6a4e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#e11d48', '#d97706'];
    for (let i = 0; i < num; i++) {
      const sample = DEFAULT_SAMPLE_TEAMS[i % DEFAULT_SAMPLE_TEAMS.length];
      const color = colors[i % colors.length];
      teams.push({
        name: i < DEFAULT_SAMPLE_TEAMS.length ? sample.name : `Team ${i + 1}`,
        short_name: i < DEFAULT_SAMPLE_TEAMS.length ? sample.short_name : `T${i + 1}`,
        color: sample?.color || color,
        players: sample?.players ? JSON.parse(JSON.stringify(sample.players)) : Array.from({ length: 15 }, (_, pIdx) => ({
          id: `p_w_${i + 1}_${pIdx + 1}`,
          name: `Player ${pIdx + 1}`,
          role: pIdx === 0 ? 'Batter' : (pIdx === 1 ? 'Wicketkeeper' : (pIdx < 7 ? 'All-Rounder' : 'Bowler')),
          is_captain: pIdx === 0,
          is_vice_captain: pIdx === 1
        }))
      });
    }
    appState.wizardData.teams = teams;
  }

  for (let i = 0; i < num; i++) {
    const team = appState.wizardData.teams[i] || {
      name: `Team ${i + 1}`,
      short_name: `T${i + 1}`,
      color: ['#ed6a4e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][i % 6]
    };
    const row = document.createElement('div');
    row.className = 'wiz-team-row';
    row.innerHTML = `
      <input type="text" class="form-control wiz-team-name" placeholder="Team ${i + 1} Name" value="${team.name}" />
      <input type="text" class="form-control wiz-team-short" placeholder="Short Code" value="${team.short_name}" maxlength="4" />
      <input type="color" class="form-control wiz-team-color" value="${team.color}" style="height: 42px; padding: 2px;" />
    `;
    container.appendChild(row);
  }
}

function saveWizardTeamsFromUI() {
  const rows = document.querySelectorAll('.wiz-team-row');
  const existingTeams = appState.wizardData.teams || [];
  appState.wizardData.teams = [];
  rows.forEach((r, idx) => {
    const name = r.querySelector('.wiz-team-name')?.value?.trim() || `Team ${idx + 1}`;
    const short_name = r.querySelector('.wiz-team-short')?.value?.trim() || name.substring(0, 3).toUpperCase();
    const color = r.querySelector('.wiz-team-color')?.value || '#ed6a4e';
    const oldPlayers = existingTeams[idx]?.players || DEFAULT_SAMPLE_TEAMS[idx % DEFAULT_SAMPLE_TEAMS.length].players;
    appState.wizardData.teams.push({
      name,
      short_name,
      color,
      players: JSON.parse(JSON.stringify(oldPlayers))
    });
  });
}

function quickFillWizardTeams() {
  const num = appState.wizardData.numTeams;
  const teams = [];
  const colors = ['#ed6a4e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#e11d48', '#d97706'];
  for (let i = 0; i < num; i++) {
    const sample = DEFAULT_SAMPLE_TEAMS[i % DEFAULT_SAMPLE_TEAMS.length];
    const color = colors[i % colors.length];
    teams.push({
      name: i < DEFAULT_SAMPLE_TEAMS.length ? sample.name : `Team ${i + 1}`,
      short_name: i < DEFAULT_SAMPLE_TEAMS.length ? sample.short_name : `T${i + 1}`,
      color: sample?.color || color,
      players: JSON.parse(JSON.stringify(sample.players))
    });
  }
  appState.wizardData.teams = teams;
  buildWizardTeamsStep();
  showToast('Teams auto-filled!');
}

function buildWizardPlayersStep() {
  const teams = appState.wizardData.teams;
  const tabs = document.querySelector('#wizTeamTabs');
  if (!tabs || !teams || teams.length === 0) return;
  tabs.innerHTML = '';

  if (appState.activeWizardTeamIndex >= teams.length) {
    appState.activeWizardTeamIndex = 0;
  }

  teams.forEach((t, idx) => {
    const btn = document.createElement('button');
    const isAct = idx === appState.activeWizardTeamIndex;
    const squadCount = t.players?.length || 0;
    const isValid = squadCount >= 11 && squadCount <= 15;
    
    btn.className = `btn btn-xs ${isAct ? 'btn-primary' : 'btn-outline'} wiz-team-tab-btn`;
    btn.innerHTML = `${isValid ? ' ' : ''}${t.name} <small>(${squadCount})</small>`;
    
    btn.onclick = () => {
      saveCurrentTeamSquad(false);
      appState.activeWizardTeamIndex = idx;
      buildWizardPlayersStep();
    };
    tabs.appendChild(btn);
  });

  renderWizardPlayerInputsForTeam(appState.activeWizardTeamIndex);
}

function renderWizardPlayerInputsForTeam(teamIndex) {
  const team = appState.wizardData.teams[teamIndex];
  const container = document.querySelector('#wizPlayersContainer');
  if (!container || !team) return;

  if (!team.players || team.players.length === 0) {
    const defaultSample = DEFAULT_SAMPLE_TEAMS[teamIndex % DEFAULT_SAMPLE_TEAMS.length]?.players || [];
    team.players = JSON.parse(JSON.stringify(defaultSample));
  }

  if (!team.players.some((p) => p.is_captain) && team.players.length > 0) {
    team.players[0].is_captain = true;
  }
  if (!team.players.some((p) => p.is_vice_captain) && team.players.length > 1) {
    team.players[1].is_vice_captain = true;
  }

  const titleEl = document.querySelector('#wizActiveTeamTitle');
  if (titleEl) titleEl.textContent = team.name;

  const countBadge = document.querySelector('#wizSquadCountBadge');
  const count = team.players.length;
  if (countBadge) {
    countBadge.textContent = `${count} / 15 Players (Min: 11, Max: 15)`;
    countBadge.className = `squad-count-badge ${count >= 11 && count <= 15 ? 'valid' : 'invalid'}`;
  }

  const addBtn = document.querySelector('#wizAddPlayerBtn');
  if (addBtn) {
    addBtn.disabled = count >= 15;
    addBtn.textContent = count >= 15 ? 'Max 15 Reached' : '＋ Add Player (Max 15)';
  }

  populateCaptainSelectors(team);

  container.innerHTML = '';
  team.players.forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = 'wiz-player-row';
    const playerNum = p.player_number || (idx + 1);
    row.innerHTML = `
      <input type="number" class="wiz-player-num-input wiz-player-num" data-player-idx="${idx}" placeholder="#" value="${playerNum}" title="Jersey / Player Number" min="1" max="999" />
      <input type="text" class="form-control wiz-player-name" data-player-idx="${idx}" placeholder="Player Name" value="${p.name}" />
      <select class="form-control wiz-player-role" data-player-idx="${idx}">
        <option value="Batter" ${p.role === 'Batter' ? 'selected' : ''}>Batter</option>
        <option value="Bowler" ${p.role === 'Bowler' ? 'selected' : ''}>Bowler</option>
        <option value="All-Rounder" ${p.role === 'All-Rounder' ? 'selected' : ''}>All-Rounder</option>
        <option value="Wicketkeeper" ${p.role === 'Wicketkeeper' ? 'selected' : ''}>Wicketkeeper</option>
      </select>
      <button class="btn btn-xs btn-danger wiz-player-del-btn" title="Remove Player" onclick="removePlayerFromActiveTeam(${idx})" ${count <= 11 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}></button>
    `;
    container.appendChild(row);
  });

  const capSelect = document.querySelector('#wizCaptainSelect');
  const vcSelect = document.querySelector('#wizViceCaptainSelect');

  container.querySelectorAll('.wiz-player-name').forEach((input) => {
    input.oninput = () => {
      const idx = Number(input.dataset.playerIdx);
      if (team.players[idx]) {
        team.players[idx].name = input.value.trim() || `Player ${idx + 1}`;
        const pNum = team.players[idx].player_number || (idx + 1);
        if (capSelect && capSelect.options[idx]) capSelect.options[idx].text = `#${pNum} ${team.players[idx].name} (${team.players[idx].role || 'Batter'})`;
        if (vcSelect && vcSelect.options[idx]) vcSelect.options[idx].text = `#${pNum} ${team.players[idx].name} (${team.players[idx].role || 'Batter'})`;
      }
    };
  });

  container.querySelectorAll('.wiz-player-num').forEach((input) => {
    input.oninput = () => {
      const idx = Number(input.dataset.playerIdx);
      if (team.players[idx]) {
        team.players[idx].player_number = Number(input.value) || (idx + 1);
        if (capSelect && capSelect.options[idx]) capSelect.options[idx].text = `#${team.players[idx].player_number} ${team.players[idx].name} (${team.players[idx].role || 'Batter'})`;
        if (vcSelect && vcSelect.options[idx]) vcSelect.options[idx].text = `#${team.players[idx].player_number} ${team.players[idx].name} (${team.players[idx].role || 'Batter'})`;
      }
    };
  });
}

function populateCaptainSelectors(team) {
  const capSelect = document.querySelector('#wizCaptainSelect');
  const vcSelect = document.querySelector('#wizViceCaptainSelect');
  if (!capSelect || !vcSelect || !team.players) return;

  const capIdx = team.players.findIndex((p) => p.is_captain);
  const vcIdx = team.players.findIndex((p) => p.is_vice_captain);
  const activeCap = capIdx >= 0 ? capIdx : 0;
  const activeVc = vcIdx >= 0 ? vcIdx : (team.players.length > 1 ? 1 : 0);

  capSelect.innerHTML = team.players.map((p, idx) => `<option value="${idx}" ${idx === activeCap ? 'selected' : ''}>#${p.player_number || idx + 1} ${p.name} (${p.role || 'Batter'})</option>`).join('');
  vcSelect.innerHTML = team.players.map((p, idx) => `<option value="${idx}" ${idx === activeVc ? 'selected' : ''}>#${p.player_number || idx + 1} ${p.name} (${p.role || 'Batter'})</option>`).join('');

  capSelect.onchange = (e) => {
    const selectedCap = Number(e.target.value);
    team.players.forEach((p, idx) => p.is_captain = idx === selectedCap);
    if (Number(vcSelect.value) === selectedCap && team.players.length > 1) {
      const newVc = (selectedCap + 1) % team.players.length;
      vcSelect.value = newVc;
      team.players.forEach((p, idx) => p.is_vice_captain = idx === newVc);
    }
  };

  vcSelect.onchange = (e) => {
    const selectedVc = Number(e.target.value);
    team.players.forEach((p, idx) => p.is_vice_captain = idx === selectedVc);
    if (Number(capSelect.value) === selectedVc && team.players.length > 1) {
      const newCap = (selectedVc + 1) % team.players.length;
      capSelect.value = newCap;
      team.players.forEach((p, idx) => p.is_captain = idx === newCap);
    }
  };
}

function addPlayerToActiveTeam() {
  const team = appState.wizardData.teams[appState.activeWizardTeamIndex];
  if (!team) return;
  if (team.players.length >= 15) {
    showToast('Maximum squad limit of 15 players reached');
    return;
  }

  const newIdx = team.players.length + 1;
  team.players.push({
    id: `p_w_${appState.activeWizardTeamIndex + 1}_${newIdx}`,
    player_number: newIdx,
    name: `Player ${newIdx}`,
    role: newIdx > 10 ? 'Bowler' : 'Batter',
    is_captain: false,
    is_vice_captain: false
  });

  buildWizardPlayersStep();
  showToast(`Player added. Squad: ${team.players.length}/15`);
}

window.removePlayerFromActiveTeam = function (idx) {
  const team = appState.wizardData.teams[appState.activeWizardTeamIndex];
  if (!team || team.players.length <= 11) {
    showToast('Minimum 11 players required per team');
    return;
  }

  const removed = team.players.splice(idx, 1)[0];
  if (removed.is_captain && team.players.length > 0) team.players[0].is_captain = true;
  if (removed.is_vice_captain && team.players.length > 1) team.players[1].is_vice_captain = true;

  buildWizardPlayersStep();
  showToast(`Player removed. Squad: ${team.players.length}/15`);
};

function saveCurrentTeamSquad(userTriggered = true) {
  const team = appState.wizardData.teams[appState.activeWizardTeamIndex];
  if (!team) return;

  const rows = document.querySelectorAll('#wizPlayersContainer .wiz-player-row');
  const capIdx = Number(document.querySelector('#wizCaptainSelect')?.value || 0);
  const vcIdx = Number(document.querySelector('#wizViceCaptainSelect')?.value || (team.players.length > 1 ? 1 : 0));

  const updatedPlayers = [];
  rows.forEach((r, idx) => {
    const player_number = Number(r.querySelector('.wiz-player-num')?.value) || (idx + 1);
    const name = r.querySelector('.wiz-player-name')?.value?.trim() || `Player ${idx + 1}`;
    const role = r.querySelector('.wiz-player-role')?.value || 'Batter';
    updatedPlayers.push({
      id: `p_w_${appState.activeWizardTeamIndex + 1}_${idx + 1}`,
      player_number,
      name,
      role,
      is_captain: idx === capIdx,
      is_vice_captain: idx === vcIdx
    });
  });

  if (updatedPlayers.length >= 11) {
    team.players = updatedPlayers;
  }

  buildWizardPlayersStep();

  if (userTriggered) {
    const capName = team.players.find((p) => p.is_captain)?.name || 'N/A';
    const vcName = team.players.find((p) => p.is_vice_captain)?.name || 'N/A';
    showToast(`Saved ${team.name} (${team.players.length} players, C: ${capName}, VC: ${vcName})`);
  }
}

function quickFillWizardPlayers() {
  appState.wizardData.teams.forEach((t, idx) => {
    const sample = DEFAULT_SAMPLE_TEAMS[idx % DEFAULT_SAMPLE_TEAMS.length];
    t.players = JSON.parse(JSON.stringify(sample.players));
  });
  buildWizardPlayersStep();
  showToast('All 15-player squads & captains auto-filled!');
}

function buildWizardScheduleStep() {
  const roundsSelect = document.querySelector('#wizTournamentRounds');
  const noteEl = document.querySelector('#wizCalculatedMatchesNote');
  const koNoteEl = document.querySelector('#wizKnockoutNote');

  function updateMatchCalculation() {
    const rounds = Number(roundsSelect?.value) || 1;
    const n = appState.wizardData.teams.length;
    if (n < 2) return;
    const matchesPerCycle = (n * (n - 1)) / 2;
    const totalMatches = rounds * matchesPerCycle;
    const matchdaysPerCycle = n % 2 === 0 ? n - 1 : n;
    const totalMatchdays = rounds * matchdaysPerCycle;
    if (noteEl) {
      noteEl.innerHTML = ` <strong>${totalMatches} matches</strong> scheduled across <strong>${totalMatchdays} matchdays</strong> (${rounds} ${rounds === 1 ? 'round' : 'rounds'} per matchup)`;
    }

    if (koNoteEl) {
      const koCount = n - 1;
      let koStage = 'Grand Final';
      if (n > 2 && n <= 4) koStage = 'Semi-Finals & Grand Final';
      else if (n > 4 && n <= 8) koStage = 'Quarter-Finals, Semi-Finals & Grand Final';
      else if (n > 8 && n <= 16) koStage = 'Round of 16, Quarter-Finals, Semi-Finals & Grand Final';
      else if (n > 16) koStage = `Round of ${1 << Math.ceil(Math.log2(n))}, Quarter-Finals, Semi-Finals & Grand Final`;
      koNoteEl.innerHTML = ` <strong>${koCount} knockout matches</strong> for all ${n} teams (${koStage}) with automatic winner advancement`;
    }
  }

  if (roundsSelect) {
    roundsSelect.onchange = () => updateMatchCalculation();
  }
  updateMatchCalculation();

  const wizGraphPreview = document.querySelector('#wizKnockoutGraphPreview');
  if (wizGraphPreview && wizGraphPreview.style.display !== 'none') {
    const previewFixtures = generateKnockoutSchedule(appState.wizardData.teams, 'tour_preview');
    renderKnockoutBracketTree('#wizKnockoutGraphPreview', previewFixtures, appState.wizardData.teams);
  }

  renderWizardManualMatchesList();
}

function renderWizardManualMatchesList() {
  const container = document.querySelector('#wizManualMatchesList');
  if (!container) return;
  container.innerHTML = '';

  const teams = appState.wizardData.teams;
  if (!appState.wizardData.manualFixtures || appState.wizardData.manualFixtures.length === 0) {
    appState.wizardData.manualFixtures = [];
    if (teams.length >= 2) {
      appState.wizardData.manualFixtures.push({
        team1Index: 0,
        team2Index: 1,
        venue: 'Stadium Pitch 1',
        date: 'Match 1'
      });
    }
  }

  appState.wizardData.manualFixtures.forEach((fix, idx) => {
    const row = document.createElement('div');
    row.className = 'manual-match-row';

    const team1Opts = teams.map((t, tIdx) => `<option value="${tIdx}" ${tIdx === fix.team1Index ? 'selected' : ''}>${t.name}</option>`).join('');
    const team2Opts = teams.map((t, tIdx) => `<option value="${tIdx}" ${tIdx === fix.team2Index ? 'selected' : ''}>${t.name}</option>`).join('');

    row.innerHTML = `
      <select class="form-control wiz-manual-t1" data-fix-idx="${idx}">${team1Opts}</select>
      <span style="font-weight: 700; color: var(--ink-muted);">VS</span>
      <select class="form-control wiz-manual-t2" data-fix-idx="${idx}">${team2Opts}</select>
      <button class="btn btn-xs btn-danger" onclick="removeWizardManualMatch(${idx})"></button>
    `;
    container.appendChild(row);
  });

  document.querySelectorAll('.wiz-manual-t1').forEach((sel) => {
    sel.onchange = (e) => {
      const fixIdx = Number(e.target.dataset.fixIdx);
      if (appState.wizardData.manualFixtures[fixIdx]) {
        appState.wizardData.manualFixtures[fixIdx].team1Index = Number(e.target.value);
      }
    };
  });
  document.querySelectorAll('.wiz-manual-t2').forEach((sel) => {
    sel.onchange = (e) => {
      const fixIdx = Number(e.target.dataset.fixIdx);
      if (appState.wizardData.manualFixtures[fixIdx]) {
        appState.wizardData.manualFixtures[fixIdx].team2Index = Number(e.target.value);
      }
    };
  });
}

window.removeWizardManualMatch = function (idx) {
  if (appState.wizardData.manualFixtures) {
    appState.wizardData.manualFixtures.splice(idx, 1);
    renderWizardManualMatchesList();
  }
};

function addWizardManualMatch() {
  const teams = appState.wizardData.teams;
  if (!teams || teams.length < 2) {
    showToast('Need at least 2 teams');
    return;
  }
  if (!appState.wizardData.manualFixtures) appState.wizardData.manualFixtures = [];
  appState.wizardData.manualFixtures.push({
    team1Index: 0,
    team2Index: 1,
    venue: `Ground Pitch ${(appState.wizardData.manualFixtures.length % 3) + 1}`,
    date: `Match ${appState.wizardData.manualFixtures.length + 1}`
  });
  renderWizardManualMatchesList();
  showToast('Matchup added');
}

async function handleWizardLaunch() {
  saveCurrentTeamSquad(false);

  const tId = `tour_${Date.now()}`;
  const teams = appState.wizardData.teams.map((t, idx) => {
    const teamId = `team_${tId}_${idx + 1}`;
    return {
      id: teamId,
      tournament_id: tId,
      name: t.name,
      short_name: t.short_name,
      color: t.color,
      players: t.players.map((p, pIdx) => ({
        id: `p_${teamId}_${pIdx + 1}`,
        tournament_id: tId,
        team_id: teamId,
        player_number: Number(p.player_number) || (pIdx + 1),
        name: p.name,
        role: p.role || 'Batter',
        is_captain: Boolean(p.is_captain),
        is_vice_captain: Boolean(p.is_vice_captain),
        runs: 0,
        balls_faced: 0,
        fours: 0,
        sixes: 0,
        high_score: 0,
        wickets: 0,
        balls_bowled: 0,
        maidens: 0,
        runs_conceded: 0,
        matches: 0
      }))
    };
  });

  const scheduleType = document.querySelector('input[name="scheduleType"]:checked')?.value || 'auto';
  const roundsCount = Number(document.querySelector('#wizTournamentRounds')?.value) || 1;
  let fixtures = [];

  if (scheduleType === 'knockout') {
    fixtures = generateKnockoutSchedule(teams, tId);
  } else if (scheduleType === 'manual' && appState.wizardData.manualFixtures && appState.wizardData.manualFixtures.length > 0) {
    fixtures = appState.wizardData.manualFixtures.map((fix, idx) => {
      const t1 = teams[fix.team1Index] || teams[0];
      const t2 = teams[fix.team2Index] || teams[1 % teams.length];
      return {
        id: `fix_${tId}_${idx + 1}`,
        tournament_id: tId,
        match_number: idx + 1,
        team1_id: t1.id,
        team1_name: t1.name,
        team1_short: t1.short_name,
        team1_color: t1.color,
        team2_id: t2.id,
        team2_name: t2.name,
        team2_short: t2.short_name,
        team2_color: t2.color,
        venue: fix.venue || `Pitch ${(idx % 3) + 1}`,
        match_date: fix.date || `Match ${idx + 1}`,
        status: 'upcoming',
        winner_team_id: null,
        result_text: null
      };
    });
  } else {
    fixtures = generateRoundRobinSchedule(teams, tId, roundsCount);
  }

  const pointsTable = teams.map((team) => ({
    tournament_id: tId,
    team_id: team.id,
    team_name: team.name,
    short_name: team.short_name,
    color: team.color,
    played: 0,
    won: 0,
    lost: 0,
    tied: 0,
    no_result: 0,
    points: 0,
    runs_scored: 0,
    balls_faced: 0,
    runs_conceded: 0,
    balls_bowled: 0,
    net_run_rate: 0.0,
    form: []
  }));

  appState.tournament = {
    id: tId,
    name: appState.wizardData.name || 'Premier Cricket Championship',
    overs: appState.wizardData.overs || 20,
    format: scheduleType === 'knockout' ? 'Knockout Cup' : 'T20 League',
    schedule_mode: scheduleType,
    rounds_count: roundsCount,
    teams,
    fixtures,
    points_table: pointsTable,
    orange_cap: [],
    purple_cap: []
  };

  if (fixtures.length > 0) {
    initMatchFromFixture(fixtures[0]);
  }

  apiFetch('/api/tournaments', 'POST', appState.tournament);

  saveToLocalStorage();
  closeTournamentWizard();
  if (scheduleType === 'knockout') {
    switchView('fixtures');
    const bBtn = document.querySelector('#fixturesBracketToggleBtn');
    if (bBtn) bBtn.click();
  } else {
    switchView('pointsTable');
  }
  renderAllViews();
  showToast(`Tournament '${appState.tournament.name}' launched!`);
}

// ----------------------------------------------------
// SQUAD EDITOR MODAL (In-Tournament Team & Squad Editing)
// ----------------------------------------------------

function openEditSquadModal(teamId) {
  const tour = appState.tournament;
  if (!tour || !tour.teams) return;

  const team = tour.teams.find((t) => t.id === teamId) || tour.teams[0];
  if (!team) return;

  appState.editingTeamId = team.id;
  appState.editingTeamSquad = JSON.parse(JSON.stringify(team.players));

  const modal = document.querySelector('#editSquadModal');
  if (modal) modal.classList.add('show');

  renderEditSquadModalUI(team);
}

function closeEditSquadModal() {
  const modal = document.querySelector('#editSquadModal');
  if (modal) modal.classList.remove('show');
}

function renderEditSquadModalUI(team) {
  const squad = appState.editingTeamSquad;
  const count = squad.length;

  const titleEl = document.querySelector('#editSquadTeamTitle');
  if (titleEl) titleEl.textContent = team.name;

  const badgeEl = document.querySelector('#editSquadCountBadge');
  if (badgeEl) {
    badgeEl.textContent = `${count} / 15 Players (Min: 11, Max: 15)`;
    badgeEl.className = `squad-count-badge ${count >= 11 && count <= 15 ? 'valid' : 'invalid'}`;
  }

  const addBtn = document.querySelector('#editSquadAddPlayerBtn');
  if (addBtn) {
    addBtn.disabled = count >= 15;
    addBtn.textContent = count >= 15 ? 'Max 15 Reached' : '＋ Add Player (Max 15)';
  }

  // Captain & Vice-Captain selects
  const capSelect = document.querySelector('#editSquadCaptainSelect');
  const vcSelect = document.querySelector('#editSquadViceCaptainSelect');

  if (capSelect && vcSelect) {
    const capIdx = squad.findIndex((p) => p.is_captain);
    const vcIdx = squad.findIndex((p) => p.is_vice_captain);
    const activeCap = capIdx >= 0 ? capIdx : 0;
    const activeVc = vcIdx >= 0 ? vcIdx : (squad.length > 1 ? 1 : 0);

    capSelect.innerHTML = squad.map((p, idx) => `<option value="${idx}" ${idx === activeCap ? 'selected' : ''}>#${idx + 1} ${p.name} (${p.role || 'Batter'})</option>`).join('');
    vcSelect.innerHTML = squad.map((p, idx) => `<option value="${idx}" ${idx === activeVc ? 'selected' : ''}>#${idx + 1} ${p.name} (${p.role || 'Batter'})</option>`).join('');

    capSelect.onchange = (e) => {
      const selectedCap = Number(e.target.value);
      squad.forEach((p, idx) => p.is_captain = idx === selectedCap);
      if (Number(vcSelect.value) === selectedCap && squad.length > 1) {
        const newVc = (selectedCap + 1) % squad.length;
        vcSelect.value = newVc;
        squad.forEach((p, idx) => p.is_vice_captain = idx === newVc);
      }
    };

    vcSelect.onchange = (e) => {
      const selectedVc = Number(e.target.value);
      squad.forEach((p, idx) => p.is_vice_captain = idx === selectedVc);
      if (Number(capSelect.value) === selectedVc && squad.length > 1) {
        const newCap = (selectedVc + 1) % squad.length;
        capSelect.value = newCap;
        squad.forEach((p, idx) => p.is_captain = idx === newCap);
      }
    };
  }

  // Players container
  const container = document.querySelector('#editSquadPlayersContainer');
  if (!container) return;
  container.innerHTML = '';

  squad.forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = 'wiz-player-row';
    const playerNum = p.player_number || (idx + 1);
    row.innerHTML = `
      <input type="number" class="wiz-player-num-input edit-squad-pnum" data-player-idx="${idx}" placeholder="#" value="${playerNum}" title="Jersey / Player Number" min="1" max="999" />
      <input type="text" class="form-control edit-squad-pname" data-player-idx="${idx}" placeholder="Player Name" value="${p.name}" />
      <select class="form-control edit-squad-prole" data-player-idx="${idx}">
        <option value="Batter" ${p.role === 'Batter' ? 'selected' : ''}>Batter</option>
        <option value="Bowler" ${p.role === 'Bowler' ? 'selected' : ''}>Bowler</option>
        <option value="All-Rounder" ${p.role === 'All-Rounder' ? 'selected' : ''}>All-Rounder</option>
        <option value="Wicketkeeper" ${p.role === 'Wicketkeeper' ? 'selected' : ''}>Wicketkeeper</option>
      </select>
      <button class="btn btn-xs btn-danger wiz-player-del-btn" title="Remove Player" onclick="removePlayerFromEditSquad(${idx})" ${count <= 11 ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}></button>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.edit-squad-pname').forEach((input) => {
    input.oninput = () => {
      const idx = Number(input.dataset.playerIdx);
      if (squad[idx]) {
        squad[idx].name = input.value.trim() || `Player ${idx + 1}`;
        const pNum = squad[idx].player_number || (idx + 1);
        if (capSelect && capSelect.options[idx]) capSelect.options[idx].text = `#${pNum} ${squad[idx].name} (${squad[idx].role || 'Batter'})`;
        if (vcSelect && vcSelect.options[idx]) vcSelect.options[idx].text = `#${pNum} ${squad[idx].name} (${squad[idx].role || 'Batter'})`;
      }
    };
  });

  container.querySelectorAll('.edit-squad-pnum').forEach((input) => {
    input.oninput = () => {
      const idx = Number(input.dataset.playerIdx);
      if (squad[idx]) {
        squad[idx].player_number = Number(input.value) || (idx + 1);
        if (capSelect && capSelect.options[idx]) capSelect.options[idx].text = `#${squad[idx].player_number} ${squad[idx].name} (${squad[idx].role || 'Batter'})`;
        if (vcSelect && vcSelect.options[idx]) vcSelect.options[idx].text = `#${squad[idx].player_number} ${squad[idx].name} (${squad[idx].role || 'Batter'})`;
      }
    };
  });
}

function addPlayerToEditSquad() {
  const squad = appState.editingTeamSquad;
  if (squad.length >= 15) {
    showToast('Maximum squad limit of 15 players reached');
    return;
  }

  const nextIdx = squad.length + 1;
  const team = appState.tournament.teams.find((t) => t.id === appState.editingTeamId);

  squad.push({
    id: `p_${team.id}_${nextIdx}`,
    tournament_id: appState.tournament.id,
    team_id: team.id,
    player_number: nextIdx,
    name: `Player ${nextIdx}`,
    role: nextIdx % 2 === 0 ? 'Bowler' : 'Batter',
    is_captain: false,
    is_vice_captain: false,
    runs: 0,
    balls_faced: 0,
    fours: 0,
    sixes: 0,
    high_score: 0,
    wickets: 0,
    balls_bowled: 0,
    maidens: 0,
    runs_conceded: 0,
    matches: 0
  });

  renderEditSquadModalUI(team);
  showToast(`Player #${nextIdx} added`);
}

window.removePlayerFromEditSquad = function (idx) {
  const squad = appState.editingTeamSquad;
  if (squad.length <= 11) {
    showToast('Squad must have at least 11 players');
    return;
  }

  const removed = squad.splice(idx, 1)[0];
  if (removed.is_captain && squad.length > 0) squad[0].is_captain = true;
  if (removed.is_vice_captain && squad.length > 1) squad[1].is_vice_captain = true;

  const team = appState.tournament.teams.find((t) => t.id === appState.editingTeamId);
  renderEditSquadModalUI(team);
  showToast(`Player removed. Squad: ${squad.length}/15`);
};

function saveEditedSquad() {
  const team = appState.tournament?.teams?.find((t) => t.id === appState.editingTeamId);
  if (!team) return;

  const rows = document.querySelectorAll('#editSquadPlayersContainer .wiz-player-row');
  const capIdx = Number(document.querySelector('#editSquadCaptainSelect')?.value || 0);
  const vcIdx = Number(document.querySelector('#editSquadViceCaptainSelect')?.value || 1);

  const updatedPlayers = [];
  rows.forEach((r, idx) => {
    const player_number = Number(r.querySelector('.edit-squad-pnum')?.value) || (idx + 1);
    const name = r.querySelector('.edit-squad-pname')?.value?.trim() || `Player ${idx + 1}`;
    const role = r.querySelector('.edit-squad-prole')?.value || 'Batter';
    const oldP = appState.editingTeamSquad[idx] || {};
    updatedPlayers.push({
      ...oldP,
      id: oldP.id || `p_${team.id}_${idx + 1}`,
      tournament_id: appState.tournament.id,
      team_id: team.id,
      player_number,
      name,
      role,
      is_captain: idx === capIdx,
      is_vice_captain: idx === vcIdx
    });
  });

  if (updatedPlayers.length < 11) {
    showToast(' Squad must contain at least 11 players');
    return;
  }

  team.players = updatedPlayers;

  // Update active match if this team is playing
  if (appState.activeMatch) {
    if (appState.activeMatch.team1.id === team.id) {
      appState.activeMatch.team1.players = updatedPlayers;
    }
    if (appState.activeMatch.team2.id === team.id) {
      appState.activeMatch.team2.players = updatedPlayers;
    }
  }

  saveToLocalStorage();
  apiFetch('/api/tournaments', 'POST', appState.tournament);

  closeEditSquadModal();
  renderAllViews();
  const capName = team.players.find((p) => p.is_captain)?.name || 'N/A';
  const vcName = team.players.find((p) => p.is_vice_captain)?.name || 'N/A';
  showToast(`Saved squad for ${team.name} (${team.players.length} players, C: ${capName}, VC: ${vcName})`);
}

// ----------------------------------------------------
// WICKET MODAL
// ----------------------------------------------------

function openWicketModal(defaultType = 'Caught') {
  const inn = getCurrentInnings();
  if (!inn) return;

  const dismissTypeEl = document.querySelector('#wktDismissalType');
  const runOutGroup = document.querySelector('#wktRunOutRunsGroup');
  const runOutRuns = document.querySelector('#wktRunOutRuns');

  if (dismissTypeEl) {
    dismissTypeEl.value = defaultType;
    if (runOutGroup) runOutGroup.style.display = defaultType === 'Run Out' ? 'block' : 'none';
    dismissTypeEl.onchange = () => {
      if (runOutGroup) runOutGroup.style.display = dismissTypeEl.value === 'Run Out' ? 'block' : 'none';
    };
  }

  if (runOutRuns) runOutRuns.value = '0';

  const fielderInput = document.querySelector('#wktFielderName');
  if (fielderInput) fielderInput.value = '';

  const batterSelect = document.querySelector('#wktBatterOut');
  if (batterSelect) {
    batterSelect.innerHTML = '';
    const striker = inn.batters.find((b) => b.player_id === inn.striker_id) || inn.batters[0];
    const nonStriker = inn.batters.find((b) => b.player_id === inn.non_striker_id) || inn.batters[1];
    if (striker) batterSelect.innerHTML += `<option value="${striker.player_id}">Striker: ${striker.name}</option>`;
    if (nonStriker) batterSelect.innerHTML += `<option value="${nonStriker.player_id}">Non-Striker: ${nonStriker.name}</option>`;
  }

  const nextSelect = document.querySelector('#wktNextBatter');
  if (nextSelect) {
    nextSelect.innerHTML = '';
    const remaining = inn.batters.filter((b) => !b.is_out && b.player_id !== inn.striker_id && b.player_id !== inn.non_striker_id);
    if (remaining.length === 0) {
      nextSelect.innerHTML = '<option value="">(All out / Last wicket)</option>';
    } else {
      remaining.forEach((b) => {
        nextSelect.innerHTML += `<option value="${b.player_id}">${b.name} (${b.role || 'Batter'})</option>`;
      });
    }
  }

  const modal = document.querySelector('#wicketModal');
  if (modal) modal.classList.add('show');
}

function closeWicketModal() {
  const modal = document.querySelector('#wicketModal');
  if (modal) modal.classList.remove('show');
}

function handleConfirmWicket() {
  const type = document.querySelector('#wktDismissalType')?.value || 'Bowled';
  const outBatterId = document.querySelector('#wktBatterOut')?.value;
  const fielder = document.querySelector('#wktFielderName')?.value?.trim() || '';
  const nextBatterId = document.querySelector('#wktNextBatter')?.value;
  const runsCompleted = type === 'Run Out' ? Number(document.querySelector('#wktRunOutRuns')?.value || 0) : 0;

  closeWicketModal();
  recordBall(runsCompleted, null, true, { type, outBatterId, fielder, nextBatterId, runsCompleted });
}

// ----------------------------------------------------
// BATSMAN SELECTION MODAL (Striker & Non-Striker)
// ----------------------------------------------------

function openBatsmanModal() {
  const inn = getCurrentInnings();
  if (!inn) return;

  const strikerSelect = document.querySelector('#selectStrikerDropdown');
  const nonStrikerSelect = document.querySelector('#selectNonStrikerDropdown');

  if (strikerSelect && nonStrikerSelect) {
    const notOutBatters = inn.batters.filter((b) => !b.is_out);

    strikerSelect.innerHTML = notOutBatters.map((b) => {
      const isCur = b.player_id === inn.striker_id;
      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
      return `<option value="${b.player_id}" ${isCur ? 'selected' : ''}>${getPlayerNamePlainText(b)} (${b.role || 'Batter'}) — ${b.runs}r (${b.balls}b, SR: ${sr})</option>`;
    }).join('');

    nonStrikerSelect.innerHTML = notOutBatters.map((b) => {
      const isCur = b.player_id === inn.non_striker_id;
      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
      return `<option value="${b.player_id}" ${isCur ? 'selected' : ''}>${getPlayerNamePlainText(b)} (${b.role || 'Batter'}) — ${b.runs}r (${b.balls}b, SR: ${sr})</option>`;
    }).join('');
  }

  const modal = document.querySelector('#batsmanModal');
  if (modal) modal.classList.add('show');
}

function closeBatsmanModal() {
  const modal = document.querySelector('#batsmanModal');
  if (modal) modal.classList.remove('show');
}

function handleConfirmBatsmen() {
  const strikerId = document.querySelector('#selectStrikerDropdown')?.value;
  const nonStrikerId = document.querySelector('#selectNonStrikerDropdown')?.value;

  if (!strikerId || !nonStrikerId) {
    showToast('Please select both batsmen');
    return;
  }

  if (strikerId === nonStrikerId) {
    showToast(' Striker and Non-Striker cannot be the same batsman');
    return;
  }

  const inn = getCurrentInnings();
  if (!inn) return;

  inn.striker_id = strikerId;
  inn.non_striker_id = nonStrikerId;

  inn.batters.forEach((b) => {
    b.is_striker = b.player_id === strikerId;
    b.is_non_striker = b.player_id === nonStrikerId;
  });

  const striker = inn.batters.find((b) => b.player_id === strikerId);
  const nonStriker = inn.batters.find((b) => b.player_id === nonStrikerId);

  closeBatsmanModal();
  saveToLocalStorage();
  renderAllViews();
  showToast(` Crease set: ${striker?.name || 'Striker'} (on strike), ${nonStriker?.name || 'Non-Striker'}`);
}

// ----------------------------------------------------
// BOWLER MODAL
// ----------------------------------------------------

function openBowlerModal() {
  const inn = getCurrentInnings();
  if (!inn) return;

  const select = document.querySelector('#nextBowlerSelect');
  if (select) {
    select.innerHTML = '';
    inn.bowlers.forEach((bw) => {
      const bOvers = `${Math.floor(bw.legal_balls / 6)}.${bw.legal_balls % 6}`;
      const bDec = Math.floor(bw.legal_balls / 6) + (bw.legal_balls % 6) / 6;
      const econ = bDec > 0 ? (bw.runs / bDec).toFixed(2) : '0.00';
      const isCur = bw.player_id === inn.current_bowler_id;
      const isLast = bw.player_id === inn.last_bowler_id;
      const note = isLast ? ' (bowled last over)' : '';
      select.innerHTML += `<option value="${bw.player_id}" ${isCur ? 'selected' : ''}>${getPlayerNamePlainText(bw)} (${bw.role || 'Bowler'}) — ${bOvers} ov, ${bw.wickets}/${bw.runs}, Econ: ${econ}${note}</option>`;
    });
  }

  const modal = document.querySelector('#bowlerModal');
  if (modal) modal.classList.add('show');
}

function closeBowlerModal() {
  const modal = document.querySelector('#bowlerModal');
  if (modal) modal.classList.remove('show');
}

function handleConfirmBowler() {
  const bowlerId = document.querySelector('#nextBowlerSelect')?.value;
  const inn = getCurrentInnings();
  if (inn && bowlerId) {
    inn.current_bowler_id = bowlerId;
    const bw = inn.bowlers.find((b) => b.player_id === bowlerId);
    closeBowlerModal();
    saveToLocalStorage();
    renderAllViews();
    showToast(` Current bowler: ${bw?.name || 'Bowler'}`);
  }
}

// ----------------------------------------------------
// QUICK MATCH MODAL
// ----------------------------------------------------

function openQuickMatchModal() {
  const tour = appState.tournament;
  if (!tour || !tour.teams || tour.teams.length < 2) {
    showToast('Need at least 2 teams');
    return;
  }
  const t1Select = document.querySelector('#quickTeam1Select');
  const t2Select = document.querySelector('#quickTeam2Select');
  if (t1Select && t2Select) {
    t1Select.innerHTML = tour.teams.map((t, idx) => `<option value="${t.id}" ${idx === 0 ? 'selected' : ''}>${t.name}</option>`).join('');
    t2Select.innerHTML = tour.teams.map((t, idx) => `<option value="${t.id}" ${idx === 1 ? 'selected' : ''}>${t.name}</option>`).join('');
  }
  const modal = document.querySelector('#quickMatchModal');
  if (modal) modal.classList.add('show');
}

function closeQuickMatchModal() {
  const modal = document.querySelector('#quickMatchModal');
  if (modal) modal.classList.remove('show');
}

function handleStartQuickMatch() {
  const t1Id = document.querySelector('#quickTeam1Select')?.value;
  const t2Id = document.querySelector('#quickTeam2Select')?.value;
  if (t1Id === t2Id) {
    showToast('Please select two different teams');
    return;
  }
  const overs = Number(document.querySelector('#quickOversSelect')?.value) || 20;
  const t1 = appState.tournament.teams.find((t) => t.id === t1Id);
  const t2 = appState.tournament.teams.find((t) => t.id === t2Id);
  if (!t1 || !t2) return;

  appState.activeMatch = createNewMatchState(t1, t2, overs, null);
  saveToLocalStorage();
  closeQuickMatchModal();
  switchView('scoreboard');
  renderAllViews();
  showToast(` Match started: ${t1.name} vs ${t2.name}`);
}

// ----------------------------------------------------
// VICTORY CELEBRATION MODAL
// ----------------------------------------------------

function openVictoryModal() {
  const match = appState.activeMatch;
  if (!match) return;

  const vTitle = document.querySelector('#victoryTitle');
  if (vTitle) vTitle.textContent = match.result_text || 'Match Concluded!';
  
  const vMargin = document.querySelector('#victoryMargin');
  if (vMargin) vMargin.textContent = match.victory_margin || '';

  const potm = match.awards?.potm;
  if (potm) {
    const vPotmName = document.querySelector('#victoryPotmName');
    if (vPotmName) vPotmName.innerHTML = formatPlayerName(potm);
    const vPotmStat = document.querySelector('#victoryPotmStat');
    if (vPotmStat) vPotmStat.textContent = `${potm.runs || 0} runs (${potm.balls || 0}b), ${potm.wickets || 0} wkts`;
  }

  // Next Match Prompt
  const nextMatchBox = document.querySelector('#victoryNextMatchBox');
  const nextMatchInfo = document.querySelector('#victoryNextMatchInfo');
  const startNextBtn = document.querySelector('#startNextMatchBtn');

  const upcomingFix = (appState.tournament?.fixtures || []).find((f) => f.status === 'upcoming' && f.id !== match.fixture_id);

  if (upcomingFix) {
    const t1 = appState.tournament.teams.find((t) => t.id === upcomingFix.team1_id);
    const t2 = appState.tournament.teams.find((t) => t.id === upcomingFix.team2_id);
    const t1Name = t1 ? t1.name : 'Team 1';
    const t2Name = t2 ? t2.name : 'Team 2';

    if (nextMatchBox) nextMatchBox.style.display = 'block';
    if (nextMatchInfo) nextMatchInfo.textContent = `Next Fixture: ${t1Name} vs ${t2Name} (${upcomingFix.stage || 'Match'})`;
    if (startNextBtn) {
      startNextBtn.textContent = `Start Next Match: ${t1 ? t1.short_name : 'T1'} vs ${t2 ? t2.short_name : 'T2'}`;
      startNextBtn.onclick = () => {
        initMatchFromFixture(upcomingFix);
        closeVictoryModal();
        switchView('scoreboard');
        showToast(`Match started: ${t1Name} vs ${t2Name}`);
      };
    }
  } else if (appState.tournament) {
    if (nextMatchBox) nextMatchBox.style.display = 'block';
    if (nextMatchInfo) nextMatchInfo.textContent = 'All tournament matches completed!';
    if (startNextBtn) {
      startNextBtn.textContent = 'View Final Awards & Standings';
      startNextBtn.onclick = () => {
        closeVictoryModal();
        switchView('leaderboards');
      };
    }
  } else {
    if (nextMatchBox) nextMatchBox.style.display = 'none';
  }

  const modal = document.querySelector('#victoryModal');
  if (modal) modal.classList.add('show');
}

function closeVictoryModal() {
  const modal = document.querySelector('#victoryModal');
  if (modal) modal.classList.remove('show');
}

// ----------------------------------------------------
// SCORECARD EXPORT
// ----------------------------------------------------

function exportScorecard() {
  const match = appState.activeMatch;
  if (!match) return;

  const allMatchBatters = [
    ...(match.innings1?.batters || []).map((b) => ({ ...b, team: match.innings1.batting_team_name })),
    ...(match.innings2?.batters || []).map((b) => ({ ...b, team: match.innings2.batting_team_name }))
  ].filter((b) => (b.balls || 0) > 0);

  const bestSRBatter = allMatchBatters.sort((a, b) => ((b.runs || 0) / b.balls) - ((a.runs || 0) / a.balls) || (b.runs || 0) - (a.runs || 0))[0] || { name: match.awards?.best_batsman?.name || 'Player', runs: 0, balls: 0 };
  const srText = bestSRBatter.balls > 0 ? `${getPlayerNamePlainText(bestSRBatter)} (${((bestSRBatter.runs / bestSRBatter.balls) * 100).toFixed(1)} SR - ${bestSRBatter.runs} off ${bestSRBatter.balls}b)` : 'N/A';

  const allMatchBowlers = [
    ...(match.innings1?.bowlers || []).map((b) => ({ ...b, team: match.innings1.bowling_team_name })),
    ...(match.innings2?.bowlers || []).map((b) => ({ ...b, team: match.innings2.bowling_team_name }))
  ].filter((b) => (b.balls || 0) > 0);

  const bestEconBowler = allMatchBowlers.sort((a, b) => ((a.runs || 0) / (a.balls / 6)) - ((b.runs || 0) / (b.balls / 6)) || (b.wickets || 0) - (a.wickets || 0))[0] || { name: match.awards?.best_bowler?.name || 'Player', runs: 0, wickets: 0, balls: 0 };
  const econText = bestEconBowler.balls > 0 ? `${getPlayerNamePlainText(bestEconBowler)} (${((bestEconBowler.runs / (bestEconBowler.balls / 6))).toFixed(2)} Econ - ${bestEconBowler.wickets}/${bestEconBowler.runs})` : 'N/A';

  const report = `
======================================================
  ${appState.tournament?.name || 'CRICKET MATCH'} SCORECARD
======================================================
${match.team1.name} vs ${match.team2.name}
Result: ${match.result_text || 'In Progress'}

1ST INNINGS: ${match.innings1.batting_team_name}
Total: ${match.innings1.runs}/${match.innings1.wickets} (${Math.floor(match.innings1.balls / 6)}.${match.innings1.balls % 6} overs)

2ND INNINGS: ${match.innings2.batting_team_name}
Total: ${match.innings2.runs}/${match.innings2.wickets} (${Math.floor(match.innings2.balls / 6)}.${match.innings2.balls % 6} overs)

Player of the Match: ${getPlayerNamePlainText(match.awards?.potm)}
Best Batsman: ${getPlayerNamePlainText(match.awards?.best_batsman)}
Best Bowler: ${getPlayerNamePlainText(match.awards?.best_bowler)}
Best Batting Strike Rate: ${srText}
Best Bowling Economy: ${econText}
======================================================
Generated offline with ScoreWizz Cricket Centre
  `.trim();

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scorecard_${match.team1.short_name}_vs_${match.team2.short_name}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Scorecard exported!');
}

// ----------------------------------------------------
// TOURNAMENT DIRECTORY & MULTI-TOURNAMENT ENGINE
// ----------------------------------------------------

function getAllTournamentsList() {
  let list = [];
  try {
    const raw = localStorage.getItem('scorewizz_all_tournaments_v4');
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    list = [];
  }

  // Ensure current active tournament is included
  if (appState.tournament && appState.tournament.id) {
    const idx = list.findIndex((t) => t.id === appState.tournament.id);
    if (idx >= 0) {
      list[idx] = appState.tournament;
    } else {
      list.unshift(appState.tournament);
    }
  }

  return list;
}

function saveTournamentToDirectory(tour) {
  if (!tour || !tour.id) return;
  try {
    let list = [];
    const raw = localStorage.getItem('scorewizz_all_tournaments_v4');
    if (raw) list = JSON.parse(raw);
    const idx = list.findIndex((t) => t.id === tour.id);
    if (idx >= 0) {
      list[idx] = tour;
    } else {
      list.unshift(tour);
    }
    localStorage.setItem('scorewizz_all_tournaments_v4', JSON.stringify(list));
  } catch (e) {
    console.error('saveTournamentToDirectory error:', e);
  }
}

function getTournamentStatus(tour) {
  if (!tour) return 'running';
  if (tour.status === 'completed') return 'completed';
  const fixtures = tour.fixtures || [];
  if (fixtures.length === 0) return 'running';
  const completedCount = fixtures.filter((f) => f.status === 'completed' || f.is_completed).length;
  if (completedCount >= fixtures.length && fixtures.length > 0) return 'completed';
  return 'running';
}

function getTournamentChampion(tour) {
  if (!tour) return null;
  if (tour.schedule_mode === 'knockout') {
    const fixtures = tour.fixtures || [];
    const finalMatch = fixtures.slice().reverse().find((f) => (f.status === 'completed' || f.is_completed) && f.winner_team_id);
    if (finalMatch) {
      const winTeam = tour.teams?.find((t) => t.id === finalMatch.winner_team_id);
      if (winTeam) return winTeam.name;
    }
  }
  // Points table leader
  if (tour.points_table && tour.points_table.length > 0) {
    const sorted = [...tour.points_table].sort((a, b) => (b.points - a.points) || (b.net_run_rate - a.net_run_rate));
    const topTeam = tour.teams?.find((t) => t.id === sorted[0].team_id) || { name: sorted[0].team_name };
    return topTeam.name || sorted[0].team_name;
  }
  return null;
}

function setActiveTournament(tourId) {
  const list = getAllTournamentsList();
  const target = list.find((t) => t.id === tourId);
  if (!target) return;

  appState.tournament = target;
  saveToLocalStorage(true);

  // Set active match to first unplayed or first fixture
  const unplayed = (target.fixtures || []).find((f) => f.status !== 'completed' && !f.is_completed);
  if (unplayed) {
    initMatchFromFixture(unplayed);
  } else if (target.fixtures && target.fixtures.length > 0) {
    initMatchFromFixture(target.fixtures[0]);
  }

  renderAllViews();
  switchView('scoreboard');
  showToast(`Active tournament set to '${target.name}'`);
}

async function deleteTournamentById(tourId) {
  const list = getAllTournamentsList();
  const target = list.find((t) => t.id === tourId);
  const name = target?.name || 'this tournament';

  if (!confirm(`Are you sure you want to delete '${name}'? This cannot be undone.`)) {
    return;
  }

  const updatedList = list.filter((t) => t.id !== tourId);
  localStorage.setItem('scorewizz_all_tournaments_v4', JSON.stringify(updatedList));

  apiFetch(`/api/tournaments/${tourId}`, 'DELETE');

  // If deleted the active tournament, switch to another or reset default
  if (appState.tournament?.id === tourId) {
    if (updatedList.length > 0) {
      appState.tournament = updatedList[0];
      saveToLocalStorage(true);
      if (appState.tournament.fixtures?.[0]) initMatchFromFixture(appState.tournament.fixtures[0]);
    } else {
      createDefaultTournament();
    }
  }

  renderAllViews();
  renderAllTournamentsView();
  showToast(`Deleted tournament '${name}'`);
}

function renderAllTournamentsView() {
  const container = document.querySelector('#allTournamentsContainer');
  if (!container) return;

  const tournaments = getAllTournamentsList();
  const filter = appState.tournamentFilter || 'all';
  const searchQuery = (document.querySelector('#searchTournamentInput')?.value || '').toLowerCase().trim();

  // Compute counts
  let runningCount = 0;
  let completedCount = 0;

  const enrichedTournaments = tournaments.map((tour) => {
    const status = getTournamentStatus(tour);
    const totalFixtures = tour.fixtures?.length || 0;
    const completedFixtures = (tour.fixtures || []).filter((f) => f.status === 'completed' || f.is_completed).length;
    const champion = status === 'completed' ? getTournamentChampion(tour) : null;
    const isActive = tour.id === appState.tournament?.id;

    if (status === 'completed') completedCount++;
    else runningCount++;

    return {
      ...tour,
      computedStatus: status,
      totalFixtures,
      completedFixtures,
      champion,
      isActive
    };
  });

  // Update Stats overview
  const statTotal = document.querySelector('#statTotalTournaments');
  const statRunning = document.querySelector('#statRunningTournaments');
  const statCompleted = document.querySelector('#statCompletedTournaments');
  if (statTotal) statTotal.textContent = enrichedTournaments.length;
  if (statRunning) statRunning.textContent = runningCount;
  if (statCompleted) statCompleted.textContent = completedCount;

  // Update filter tab counts
  const cAll = document.querySelector('#countTourAll');
  const cRunning = document.querySelector('#countTourRunning');
  const cCompleted = document.querySelector('#countTourCompleted');
  if (cAll) cAll.textContent = enrichedTournaments.length;
  if (cRunning) cRunning.textContent = runningCount;
  if (cCompleted) cCompleted.textContent = completedCount;

  // Filter list
  let displayed = enrichedTournaments.filter((t) => {
    if (filter === 'running' && t.computedStatus !== 'running') return false;
    if (filter === 'completed' && t.computedStatus !== 'completed') return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery)) return false;
    return true;
  });

  if (displayed.length === 0) {
    container.innerHTML = `
      <div class="panel" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
        <h3 style="color: var(--ink); margin-bottom: 8px;">No tournaments found</h3>
        <p class="muted" style="margin-bottom: 18px;">${searchQuery ? 'No tournaments match your search.' : `No ${filter !== 'all' ? filter : ''} tournaments found in directory.`}</p>
        <button class="btn btn-primary" onclick="openTournamentWizard()">＋ Create New Tournament</button>
      </div>
    `;
    return;
  }

  container.innerHTML = displayed.map((t) => {
    const isCompleted = t.computedStatus === 'completed';
    const percent = t.totalFixtures > 0 ? Math.round((t.completedFixtures / t.totalFixtures) * 100) : 0;

    const teamBadges = (t.teams || []).slice(0, 6).map((tm) => `
      <span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: var(--radius-full); font-size: 11px; background: var(--bg-card); border: 1px solid var(--line); color: var(--ink);">
        <span style="width: 7px; height: 7px; border-radius: 50%; background: ${tm.color || 'var(--coral)'};"></span>
        ${tm.short_name || tm.name}
      </span>
    `).join('');

    const moreTeamsCount = (t.teams?.length || 0) > 6 ? `<span class="muted" style="font-size: 11px; align-self: center;">+${t.teams.length - 6} more</span>` : '';

    return `
      <div class="panel tour-directory-card ${t.isActive ? 'tour-active-card' : ''}" style="display: flex; flex-direction: column; justify-content: space-between; border: 1px solid ${t.isActive ? 'var(--coral)' : 'var(--line)'}; position: relative; transition: all 0.2s ease;">
        <div>
          <!-- Header row -->
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
            <div>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 4px;">
                <span class="badge" style="background: ${isCompleted ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${isCompleted ? 'var(--gold)' : '#10b981'}; font-weight: 700; font-size: 10px; padding: 3px 8px; border-radius: var(--radius-full);">
                  ${isCompleted ? 'COMPLETED' : 'RUNNING'}
                </span>
                ${t.isActive ? `<span class="badge" style="background: rgba(237, 106, 78, 0.15); color: var(--coral); font-weight: 700; font-size: 10px; padding: 3px 8px; border-radius: var(--radius-full);">CURRENT ACTIVE</span>` : ''}
              </div>
              <h3 style="font-size: 18px; color: var(--ink); margin: 0; line-height: 1.3;">${t.name}</h3>
              <p class="muted" style="font-size: 12px; margin-top: 2px;">
                ${t.overs} Overs • ${t.teams?.length || 0} Teams • ${t.format || 'T20 League'}
              </p>
            </div>
          </div>

          <!-- Champion Box if completed -->
          ${isCompleted && t.champion ? `
            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-sm); padding: 8px 12px; margin: 10px 0;">
              <small style="color: var(--gold); font-size: 10px; font-weight: 700; text-transform: uppercase;">TOURNAMENT WINNER</small>
              <div style="font-size: 14px; font-weight: 700; color: var(--ink);">${t.champion}</div>
            </div>
          ` : ''}

          <!-- Matches Progress -->
          <div style="margin: 12px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
              <span class="muted">Matches Progress</span>
              <strong style="color: var(--ink);">${t.completedFixtures} / ${t.totalFixtures} (${percent}%)</strong>
            </div>
            <div class="progress" style="height: 6px; background: var(--bg-card-alt); border-radius: 99px; overflow: hidden;">
              <i style="display: block; height: 100%; width: ${percent}%; background: ${isCompleted ? 'var(--gold)' : 'var(--coral)'}; border-radius: 99px;"></i>
            </div>
          </div>

          <!-- Team Chips -->
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 14px;">
            ${teamBadges}
            ${moreTeamsCount}
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; border-top: 1px solid var(--line); padding-top: 12px; margin-top: 10px; flex-wrap: wrap;">
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${t.isActive ? `
              <button class="btn btn-sm btn-primary" style="opacity: 0.8; cursor: default;">Active Now</button>
            ` : `
              <button class="btn btn-sm btn-primary" onclick="setActiveTournament('${t.id}')">Open / Set Active</button>
            `}
            <button class="btn btn-sm btn-outline" onclick="setActiveTournament('${t.id}'); switchView('fixtures');">Matches</button>
            <button class="btn btn-sm btn-outline" onclick="setActiveTournament('${t.id}'); switchView('pointsTable');">Points</button>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="deleteTournamentById('${t.id}')" style="color: var(--red); font-size: 12px;" title="Delete Tournament">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}