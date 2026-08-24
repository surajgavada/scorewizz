/**
 * ScoreWizz - Shared Core Engine
 * Common data models, calculation algorithms, storage sync, and bracket generators
 */

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
  selectedTeamTabId: null,
  tournamentFilter: 'all'
};

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

function showToast(message, duration = 2500) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'toast show';
  setTimeout(() => {
    toast.className = 'toast';
  }, duration);
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
    if (savedT) {
      appState.tournament = JSON.parse(savedT);
    }
    const savedM = localStorage.getItem('scorewizz_active_match_v4') || localStorage.getItem('scorewizz_active_match_v3') || localStorage.getItem('scorewizz_active_match_v2');
    if (savedM) {
      appState.activeMatch = JSON.parse(savedM);
    }
  } catch (e) {
    console.error('LocalStorage load error:', e);
  }
}

async function apiFetch(endpoint, method = 'GET', body = null) {
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(endpoint, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API call ${endpoint} failed, continuing offline:`, err);
    return null;
  }
}

function getAllTournamentsList() {
  let list = [];
  try {
    const raw = localStorage.getItem('scorewizz_all_tournaments_v4');
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    list = [];
  }

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
  if (tour.points_table && tour.points_table.length > 0) {
    const sorted = [...tour.points_table].sort((a, b) => (b.points - a.points) || (b.net_run_rate - a.net_run_rate));
    const topTeam = tour.teams?.find((t) => t.id === sorted[0].team_id) || { name: sorted[0].team_name };
    return topTeam.name || sorted[0].team_name;
  }
  return null;
}

function getCurrentInnings() {
  if (!appState.activeMatch) return null;
  return appState.activeMatch.current_innings === 1 ? appState.activeMatch.innings1 : appState.activeMatch.innings2;
}

// ----------------------------------------------------
// DEFAULT TOURNAMENT INITIALIZATION
// ----------------------------------------------------

function createDefaultTournament() {
  const teams = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_TEAMS));
  const tournamentId = 'tour_' + Date.now();
  const fixtures = generateRoundRobinSchedule(teams, tournamentId, 1);
  const pointsTable = teams.map((team) => ({
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
    overs_faced: 0.0,
    runs_conceded: 0,
    overs_bowled: 0.0,
    net_run_rate: 0.0,
    form: []
  }));

  appState.tournament = {
    id: tournamentId,
    name: 'Premier T20 Championship 2026',
    format: 'T20 League',
    overs: 20,
    schedule_mode: 'round_robin',
    league_rounds: 1,
    teams,
    fixtures,
    points_table: pointsTable,
    created_at: new Date().toISOString()
  };

  saveToLocalStorage(true);
  initMatchFromFixture(fixtures[0]);
}

function generateRoundRobinSchedule(teams, tournamentId, rounds = 1) {
  const fixtures = [];
  let matchCounter = 1;
  const numRounds = Math.max(1, Math.min(4, Number(rounds) || 1));

  for (let r = 1; r <= numRounds; r++) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const t1 = r % 2 === 1 ? teams[i] : teams[j];
        const t2 = r % 2 === 1 ? teams[j] : teams[i];
        const roundSuffix = numRounds > 1 ? ` (Round ${r})` : '';

        fixtures.push({
          id: `match_${tournamentId}_r${r}_${matchCounter}`,
          tournament_id: tournamentId,
          match_number: matchCounter,
          round_label: `Round ${r}`,
          team1: { id: t1.id, name: t1.name, short_name: t1.short_name, color: t1.color },
          team2: { id: t2.id, name: t2.name, short_name: t2.short_name, color: t2.color },
          venue: `${t1.name.split(' ')[0]} Cricket Ground`,
          match_date: `Match #${matchCounter}${roundSuffix}`,
          status: 'upcoming',
          result_text: null,
          winner_team_id: null,
          innings1_score: null,
          innings2_score: null
        });
        matchCounter++;
      }
    }
  }
  return fixtures;
}

function generateKnockoutSchedule(teams, tournamentId) {
  const fixtures = [];
  const N = teams.length;
  if (N < 2) return fixtures;

  let power = 2;
  while (power < N) {
    power *= 2;
  }

  const numByes = power - N;
  const numR1Matches = (N - numByes) / 2;

  function getRoundName(remainingCount) {
    if (remainingCount === 2) return 'Final';
    if (remainingCount === 4) return 'Semi-Finals';
    if (remainingCount === 8) return 'Quarter-Finals';
    if (remainingCount === 16) return 'Round of 16';
    if (remainingCount === 32) return 'Round of 32';
    if (remainingCount === 64) return 'Round of 64';
    return `Round of ${remainingCount}`;
  }

  let matchIndex = 1;
  const currentLevelNodes = [];

  const r1RoundName = getRoundName(power);
  for (let i = 0; i < numR1Matches; i++) {
    const t1 = teams[i * 2];
    const t2 = teams[i * 2 + 1];
    const matchId = `match_${tournamentId}_r1_${matchIndex}`;
    const fixture = {
      id: matchId,
      tournament_id: tournamentId,
      match_number: matchIndex,
      round_label: r1RoundName,
      round_index: 1,
      match_in_round: i + 1,
      team1: { id: t1.id, name: t1.name, short_name: t1.short_name, color: t1.color },
      team2: { id: t2.id, name: t2.name, short_name: t2.short_name, color: t2.color },
      venue: `${t1.name.split(' ')[0]} Stadium`,
      match_date: `Match #${matchIndex} • ${r1RoundName}`,
      status: 'upcoming',
      result_text: null,
      winner_team_id: null,
      innings1_score: null,
      innings2_score: null,
      next_match_id: null,
      slot: null
    };
    fixtures.push(fixture);
    currentLevelNodes.push({ type: 'match', id: matchId, matchNumber: matchIndex });
    matchIndex++;
  }

  for (let b = 0; b < numByes; b++) {
    const byeTeam = teams[numR1Matches * 2 + b];
    currentLevelNodes.push({
      type: 'bye',
      team: { id: byeTeam.id, name: byeTeam.name, short_name: byeTeam.short_name, color: byeTeam.color }
    });
  }

  let levelNodes = currentLevelNodes;
  let remainingTeamsInRound = power / 2;
  let roundIdx = 2;

  while (remainingTeamsInRound >= 1) {
    const nextLevelNodes = [];
    const roundName = getRoundName(remainingTeamsInRound * 2);

    for (let i = 0; i < remainingTeamsInRound; i++) {
      const nodeA = levelNodes[i * 2];
      const nodeB = levelNodes[i * 2 + 1];
      const matchId = `match_${tournamentId}_r${roundIdx}_${matchIndex}`;

      let t1 = null;
      let t2 = null;

      if (nodeA?.type === 'bye') {
        t1 = nodeA.team;
      }
      if (nodeB?.type === 'bye') {
        t2 = nodeB.team;
      }

      const matchDateLabel = remainingTeamsInRound === 1
        ? `GRAND FINAL • Match #${matchIndex}`
        : `${roundName} • Match #${matchIndex}`;

      const fixture = {
        id: matchId,
        tournament_id: tournamentId,
        match_number: matchIndex,
        round_label: roundName,
        round_index: roundIdx,
        match_in_round: i + 1,
        team1: t1 ? { id: t1.id, name: t1.name, short_name: t1.short_name, color: t1.color } : { id: null, name: `Winner of ${nodeA?.matchNumber ? 'Match #' + nodeA.matchNumber : 'TBD'}`, short_name: 'TBD', color: '#94a3b8' },
        team2: t2 ? { id: t2.id, name: t2.name, short_name: t2.short_name, color: t2.color } : { id: null, name: `Winner of ${nodeB?.matchNumber ? 'Match #' + nodeB.matchNumber : 'TBD'}`, short_name: 'TBD', color: '#94a3b8' },
        venue: 'Championship Stadium',
        match_date: matchDateLabel,
        status: 'upcoming',
        result_text: null,
        winner_team_id: null,
        innings1_score: null,
        innings2_score: null,
        next_match_id: null
      };

      fixtures.push(fixture);

      if (nodeA?.type === 'match') {
        const prevFix = fixtures.find((f) => f.id === nodeA.id);
        if (prevFix) {
          prevFix.next_match_id = matchId;
          prevFix.slot = 'team1';
        }
      }
      if (nodeB?.type === 'match') {
        const prevFix = fixtures.find((f) => f.id === nodeB.id);
        if (prevFix) {
          prevFix.next_match_id = matchId;
          prevFix.slot = 'team2';
        }
      }

      nextLevelNodes.push({ type: 'match', id: matchId, matchNumber: matchIndex });
      matchIndex++;
    }

    levelNodes = nextLevelNodes;
    remainingTeamsInRound = Math.floor(remainingTeamsInRound / 2);
    roundIdx++;
  }

  return fixtures;
}

function renderKnockoutBracketTree(containerSelector, fixtures, allTeams) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  if (!fixtures || fixtures.length === 0) {
    container.innerHTML = '<p class="muted" style="text-align: center; padding: 20px;">No knockout fixtures available.</p>';
    return;
  }

  const roundsMap = {};
  fixtures.forEach((fix) => {
    const rIdx = fix.round_index || 1;
    if (!roundsMap[rIdx]) roundsMap[rIdx] = [];
    roundsMap[rIdx].push(fix);
  });

  const roundIndices = Object.keys(roundsMap).map(Number).sort((a, b) => a - b);
  let treeHtml = '<div class="bracket-tree">';

  roundIndices.forEach((rIdx) => {
    const roundFixtures = roundsMap[rIdx];
    const roundLabel = roundFixtures[0]?.round_label || `Round ${rIdx}`;
    const isFinal = roundLabel.toLowerCase().includes('final') && !roundLabel.toLowerCase().includes('semi');

    treeHtml += `
      <div class="bracket-round ${isFinal ? 'final-round' : ''}">
        <div class="bracket-round-header">${roundLabel}</div>
        <div class="bracket-matches-list">
    `;

    roundFixtures.forEach((match) => {
      const isCompleted = match.status === 'completed' || match.is_completed;
      const t1Won = isCompleted && match.winner_team_id === match.team1?.id;
      const t2Won = isCompleted && match.winner_team_id === match.team2?.id;

      treeHtml += `
        <div class="bracket-match-card ${isFinal ? 'is-final' : ''} ${isCompleted ? 'completed' : ''}" data-match-id="${match.id}">
          <div class="bracket-match-head">
            <span>Match #${match.match_number}</span>
            <span class="badge ${isCompleted ? 'badge-success' : 'badge-ghost'}">${isCompleted ? 'COMPLETED' : 'UPCOMING'}</span>
          </div>

          <div class="bracket-team-row ${t1Won ? 'winner' : ''}">
            <div class="bracket-team-info">
              <span class="team-dot" style="background: ${match.team1?.color || 'var(--coral)'};"></span>
              <span class="bracket-team-name">${match.team1?.name || 'TBD'}</span>
            </div>
            <strong class="bracket-team-score">${match.innings1_score ? match.innings1_score.split(' ')[0] : ''}</strong>
          </div>

          <div class="bracket-team-row ${t2Won ? 'winner' : ''}">
            <div class="bracket-team-info">
              <span class="team-dot" style="background: ${match.team2?.color || 'var(--blue)'};"></span>
              <span class="bracket-team-name">${match.team2?.name || 'TBD'}</span>
            </div>
            <strong class="bracket-team-score">${match.innings2_score ? match.innings2_score.split(' ')[0] : ''}</strong>
          </div>

          ${isCompleted && match.result_text ? `
            <div class="bracket-match-result">${match.result_text}</div>
          ` : ''}
        </div>
      `;
    });

    treeHtml += `
        </div>
      </div>
    `;
  });

  treeHtml += '</div>';
  container.innerHTML = treeHtml;
}

function initMatchFromFixture(fixture) {
  if (!fixture) return;

  const t1 = appState.tournament?.teams?.find((t) => t.id === fixture.team1.id) || fixture.team1;
  const t2 = appState.tournament?.teams?.find((t) => t.id === fixture.team2.id) || fixture.team2;

  const t1Players = t1.players && t1.players.length > 0 ? t1.players : (DEFAULT_SAMPLE_TEAMS[0].players || []);
  const t2Players = t2.players && t2.players.length > 0 ? t2.players : (DEFAULT_SAMPLE_TEAMS[1].players || []);

  const oversLimit = appState.tournament?.overs || 20;

  const striker = t1Players[0] || { id: 'p_t1_1', name: 'Striker' };
  const nonStriker = t1Players[1] || { id: 'p_t1_2', name: 'Non-Striker' };
  const openingBowler = t2Players[0] || { id: 'p_t2_1', name: 'Bowler' };

  appState.activeMatch = {
    id: fixture.id,
    tournament_id: appState.tournament?.id,
    fixture_id: fixture.id,
    team1: t1,
    team2: t2,
    overs_limit: oversLimit,
    current_innings: 1,
    target: null,
    is_match_completed: false,
    result_text: null,
    winner_team_id: null,
    innings1: {
      batting_team_id: t1.id,
      batting_team_name: t1.name,
      batting_team_short: t1.short_name,
      bowling_team_id: t2.id,
      bowling_team_name: t2.name,
      runs: 0,
      wickets: 0,
      balls: 0,
      extras: { wides: 0, no_balls: 0, leg_byes: 0, byes: 0, penalty: 0, total: 0 },
      batters: t1Players.map((p, idx) => ({
        player_id: p.id,
        player_number: p.player_number,
        name: p.name,
        is_captain: !!p.is_captain,
        is_vice_captain: !!p.is_vice_captain,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        is_out: false,
        dismissal: 'not out',
        is_striker: idx === 0,
        is_non_striker: idx === 1
      })),
      bowlers: t2Players.map((p) => ({
        player_id: p.id,
        player_number: p.player_number,
        name: p.name,
        is_captain: !!p.is_captain,
        is_vice_captain: !!p.is_vice_captain,
        legal_balls: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        dots: 0
      })),
      striker_id: striker.id,
      non_striker_id: nonStriker.id,
      current_bowler_id: openingBowler.id,
      current_over_balls: [],
      timeline_balls: [],
      partnership: { runs: 0, balls: 0 },
      fall_of_wickets: [],
      is_completed: false
    },
    innings2: {
      batting_team_id: t2.id,
      batting_team_name: t2.name,
      batting_team_short: t2.short_name,
      bowling_team_id: t1.id,
      bowling_team_name: t1.name,
      runs: 0,
      wickets: 0,
      balls: 0,
      extras: { wides: 0, no_balls: 0, leg_byes: 0, byes: 0, penalty: 0, total: 0 },
      batters: t2Players.map((p, idx) => ({
        player_id: p.id,
        player_number: p.player_number,
        name: p.name,
        is_captain: !!p.is_captain,
        is_vice_captain: !!p.is_vice_captain,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        is_out: false,
        dismissal: 'not out',
        is_striker: idx === 0,
        is_non_striker: idx === 1
      })),
      bowlers: t1Players.map((p) => ({
        player_id: p.id,
        player_number: p.player_number,
        name: p.name,
        is_captain: !!p.is_captain,
        is_vice_captain: !!p.is_vice_captain,
        legal_balls: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        dots: 0
      })),
      striker_id: t2Players[0]?.id || 'p_t2_1',
      non_striker_id: t2Players[1]?.id || 'p_t2_2',
      current_bowler_id: t1Players[0]?.id || 'p_t1_1',
      current_over_balls: [],
      timeline_balls: [],
      partnership: { runs: 0, balls: 0 },
      fall_of_wickets: [],
      is_completed: false
    },
    awards: null
  };

  saveToLocalStorage(true);
}

function updateTournamentStandings(match) {
  if (!appState.tournament || !match || !match.is_match_completed) return;
  const tour = appState.tournament;
  if (!tour.points_table) return;

  const fix = tour.fixtures?.find((f) => f.id === match.id || f.id === match.fixture_id);
  if (fix) {
    fix.status = 'completed';
    fix.is_completed = true;
    fix.result_text = match.result_text;
    fix.winner_team_id = match.winner_team_id;
    fix.innings1_score = `${match.innings1.runs}/${match.innings1.wickets} (${Math.floor(match.innings1.balls / 6)}.${match.innings1.balls % 6} ov)`;
    fix.innings2_score = `${match.innings2.runs}/${match.innings2.wickets} (${Math.floor(match.innings2.balls / 6)}.${match.innings2.balls % 6} ov)`;

    if (tour.schedule_mode === 'knockout' && fix.next_match_id && match.winner_team_id) {
      const nextMatch = tour.fixtures.find((f) => f.id === fix.next_match_id);
      const winnerTeam = tour.teams.find((t) => t.id === match.winner_team_id);
      if (nextMatch && winnerTeam) {
        if (fix.slot === 'team1') {
          nextMatch.team1 = { id: winnerTeam.id, name: winnerTeam.name, short_name: winnerTeam.short_name, color: winnerTeam.color };
        } else if (fix.slot === 'team2') {
          nextMatch.team2 = { id: winnerTeam.id, name: winnerTeam.name, short_name: winnerTeam.short_name, color: winnerTeam.color };
        }
      }
    }
  }

  const t1Row = tour.points_table.find((r) => r.team_id === match.team1.id);
  const t2Row = tour.points_table.find((r) => r.team_id === match.team2.id);

  if (t1Row && t2Row) {
    t1Row.played += 1;
    t2Row.played += 1;

    t1Row.runs_scored += match.innings1.runs;
    t1Row.overs_faced += match.innings1.balls / 6;
    t1Row.runs_conceded += match.innings2.runs;
    t1Row.overs_bowled += match.innings2.balls / 6;

    t2Row.runs_scored += match.innings2.runs;
    t2Row.overs_faced += match.innings2.balls / 6;
    t2Row.runs_conceded += match.innings1.runs;
    t2Row.overs_bowled += match.innings1.balls / 6;

    if (match.winner_team_id === match.team1.id) {
      t1Row.won += 1;
      t1Row.points += 2;
      t1Row.form.unshift('W');
      t2Row.lost += 1;
      t2Row.form.unshift('L');
    } else if (match.winner_team_id === match.team2.id) {
      t2Row.won += 1;
      t2Row.points += 2;
      t2Row.form.unshift('W');
      t1Row.lost += 1;
      t1Row.form.unshift('L');
    } else {
      t1Row.tied += 1;
      t2Row.tied += 1;
      t1Row.points += 1;
      t2Row.points += 1;
      t1Row.form.unshift('T');
      t2Row.form.unshift('T');
    }

    t1Row.form = t1Row.form.slice(0, 5);
    t2Row.form = t2Row.form.slice(0, 5);

    const calcNRR = (row) => {
      const runRateFor = row.overs_faced > 0 ? row.runs_scored / row.overs_faced : 0;
      const runRateAgainst = row.overs_bowled > 0 ? row.runs_conceded / row.overs_bowled : 0;
      return Number((runRateFor - runRateAgainst).toFixed(3));
    };

    t1Row.net_run_rate = calcNRR(t1Row);
    t2Row.net_run_rate = calcNRR(t2Row);

    tour.points_table.sort((a, b) => b.points - a.points || b.net_run_rate - a.net_run_rate);
  }

  saveToLocalStorage(true);
  apiFetch('/api/matches', 'POST', {
    tournament_id: tour.id,
    match: match
  });
}

function computeAwards(match) {
  if (!match) return null;
  const allBatters = [
    ...(match.innings1?.batters || []).map((b) => ({ ...b, team: match.innings1.batting_team_name })),
    ...(match.innings2?.batters || []).map((b) => ({ ...b, team: match.innings2.batting_team_name }))
  ];
  const allBowlers = [
    ...(match.innings1?.bowlers || []).map((b) => ({ ...b, team: match.innings1.bowling_team_name })),
    ...(match.innings2?.bowlers || []).map((b) => ({ ...b, team: match.innings2.bowling_team_name }))
  ];

  const bestBat = [...allBatters].sort((a, b) => b.runs - a.runs || a.balls - b.balls)[0] || { name: 'Player', runs: 0, balls: 0 };
  const bestBowl = [...allBowlers].sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0] || { name: 'Player', wickets: 0, runs: 0, legal_balls: 0 };

  const qualifiedBatters = allBatters.filter((b) => (b.balls || 0) >= 5);
  const bestSR = (qualifiedBatters.length > 0 ? qualifiedBatters : allBatters).sort((a, b) => ((b.runs || 0) / (b.balls || 1)) - ((a.runs || 0) / (a.balls || 1)))[0] || bestBat;

  const potmCandidate = (bestBat.runs >= 40 || bestBowl.wickets >= 3)
    ? (bestBowl.wickets >= 3 && bestBowl.wickets * 25 > bestBat.runs ? bestBowl : bestBat)
    : (bestBat.runs >= bestBowl.wickets * 20 ? bestBat : bestBowl);

  return {
    potm: potmCandidate,
    best_batsman: bestBat,
    best_bowler: bestBowl,
    best_sr: bestSR
  };
}

function initTheme() {
  const savedTheme = localStorage.getItem('scorewizz_theme');
  const themeBtn = document.querySelector('#themeToggleBtn');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeBtn) themeBtn.textContent = 'Light';
  } else {
    document.body.classList.remove('dark-theme');
    if (themeBtn) themeBtn.textContent = 'Dark';
  }

  if (themeBtn) {
    themeBtn.onclick = () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      themeBtn.textContent = isDark ? 'Light' : 'Dark';
      localStorage.setItem('scorewizz_theme', isDark ? 'dark' : 'light');
      showToast(isDark ? 'Dark Theme activated' : 'Light Theme activated');
    };
  }
}
