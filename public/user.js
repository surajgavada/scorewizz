/**
 * ScoreWizz - User & Spectator Match Center
 * Read-only spectator interface with real-time auto-synchronization
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadFromLocalStorage();

  if (!appState.tournament) {
    createDefaultTournament();
  }

  renderAllUserViews();
  setupUserEventListeners();

  // Highlight active nav
  const initialView = appState.currentView || 'scoreboard';
  switchUserView(initialView);

  // Live Auto-Sync: Listen for scoring events from Admin in localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === 'scorewizz_active_match_v4' || e.key === 'scorewizz_tournament_v4') {
      loadFromLocalStorage();
      renderAllUserViews();
    }
  });

  // Polling fallback to keep view synced smoothly
  setInterval(() => {
    loadFromLocalStorage();
    renderUserScoreboard();
  }, 2000);
});

// View Switcher
function switchUserView(viewName) {
  appState.currentView = viewName;
  document.querySelectorAll('.view').forEach((el) => el.classList.remove('active'));
  const target = document.querySelector(`#${viewName}View`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.sidebar-nav a[data-view]').forEach((link) => {
    if (link.getAttribute('data-view') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  if (viewName === 'scoreboard') renderUserScoreboard();
  else if (viewName === 'scorecard') renderUserScorecard();
  else if (viewName === 'points') renderUserPointsTable();
  else if (viewName === 'schedule') renderUserSchedule();
  else if (viewName === 'teams') renderUserTeams();
  else if (viewName === 'leaderboards') renderUserLeaderboards();
  else if (viewName === 'summary') renderUserMatchSummary();
  else if (viewName === 'allTournaments') renderUserTournamentsDirectory();
}

function renderAllUserViews() {
  renderUserScoreboard();
  renderUserScorecard();
  renderUserPointsTable();
  renderUserSchedule();
  renderUserTeams();
  renderUserLeaderboards();
  renderUserMatchSummary();
  renderUserTournamentsDirectory();
}

// ----------------------------------------------------
// SPECTATOR RENDERERS
// ----------------------------------------------------

function renderUserScoreboard() {
  const match = appState.activeMatch;
  if (!match) return;

  const inn = getCurrentInnings();
  if (!inn) return;

  const matchTitle = document.querySelector('#matchTitle');
  if (matchTitle) matchTitle.textContent = `${match.team1.name} vs ${match.team2.name}`;

  // Score Hero 3-Column Banner
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

  // Batters Table
  const striker = inn.batters.find((b) => b.player_id === inn.striker_id) || inn.batters[0] || { name: 'Striker', runs: 0, balls: 0, fours: 0, sixes: 0 };
  const nonStriker = inn.batters.find((b) => b.player_id === inn.non_striker_id) || inn.batters[1] || { name: 'Non-Striker', runs: 0, balls: 0, fours: 0, sixes: 0 };

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

  const partRuns = document.querySelector('#partnershipRuns');
  if (partRuns) partRuns.textContent = `${inn.partnership.runs} runs`;
  const partBalls = document.querySelector('#partnershipBalls');
  if (partBalls) partBalls.textContent = `(${inn.partnership.balls} balls)`;

  // Bowler Card
  const bowler = inn.bowlers.find((b) => b.player_id === inn.current_bowler_id) || inn.bowlers[0] || { name: 'Bowler', legal_balls: 0, runs: 0, wickets: 0, maidens: 0 };
  const bName = document.querySelector('#currentBowlerName');
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

  // Over Strip
  const strip = document.querySelector('#thisOverStrip');
  if (strip) {
    strip.innerHTML = '';
    inn.current_over_balls.forEach((ball) => {
      const span = document.createElement('span');
      span.className = ball.className || '';
      span.textContent = ball.text;
      strip.appendChild(span);
    });
  }

  const thisOverTotal = inn.current_over_balls.reduce((sum, b) => sum + (b.runs || 0) + (b.extra === 'WD' || b.extra === 'NB' ? 1 : 0), 0);
  const thisOverEl = document.querySelector('#thisOverRuns');
  if (thisOverEl) thisOverEl.textContent = `${thisOverTotal} runs`;

  // Timeline
  const timelineRow = document.querySelector('#timelineRow');
  if (timelineRow) {
    const currentInnBalls = inn.timeline_balls || [];
    if (currentInnBalls.length === 0) {
      timelineRow.innerHTML = `<span class="muted" style="padding: 10px;">${match.current_innings === 1 ? '1st Innings' : '2nd Innings'} in progress...</span>`;
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

  // Summary Panel
  const summaryPanel = document.querySelector('#scoreboardSummaryPanel');
  if (match.is_match_completed && summaryPanel) {
    summaryPanel.style.display = 'block';
    const resText = document.querySelector('#summaryResultText');
    if (resText) resText.textContent = match.result_text || 'Match Completed!';
  } else if (summaryPanel) {
    summaryPanel.style.display = 'none';
  }
}

function renderUserScorecard() {
  const match = appState.activeMatch;
  if (!match) return;

  const heading = document.querySelector('#scorecardHeading');
  if (heading) heading.textContent = `${match.team1.name} vs ${match.team2.name}`;

  const renderInnTable = (inn, batTableId, bowlTableId, totalBadgeId) => {
    const batTable = document.querySelector(`#${batTableId} tbody`);
    const bowlTable = document.querySelector(`#${bowlTableId} tbody`);
    const totalBadge = document.querySelector(`#${totalBadgeId}`);

    if (totalBadge && inn) {
      totalBadge.textContent = `${inn.runs}/${inn.wickets} (${Math.floor(inn.balls / 6)}.${inn.balls % 6} ov)`;
    }

    if (batTable && inn) {
      batTable.innerHTML = '';
      inn.batters.forEach((b) => {
        const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${formatPlayerName(b)}</strong></td>
          <td class="muted">${b.dismissal || 'not out'}</td>
          <td class="text-right"><strong>${b.runs}</strong></td>
          <td class="text-right">${b.balls}</td>
          <td class="text-right">${b.fours}</td>
          <td class="text-right">${b.sixes}</td>
          <td class="text-right">${sr}</td>
        `;
        batTable.appendChild(tr);
      });
    }

    if (bowlTable && inn) {
      bowlTable.innerHTML = '';
      inn.bowlers.forEach((b) => {
        const overs = `${Math.floor(b.legal_balls / 6)}.${b.legal_balls % 6}`;
        const dec = Math.floor(b.legal_balls / 6) + (b.legal_balls % 6) / 6;
        const econ = dec > 0 ? (b.runs / dec).toFixed(2) : '0.00';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${formatPlayerName(b)}</strong></td>
          <td class="text-right">${overs}</td>
          <td class="text-right">${b.maidens}</td>
          <td class="text-right">${b.runs}</td>
          <td class="text-right"><strong>${b.wickets}</strong></td>
          <td class="text-right">${econ}</td>
        `;
        bowlTable.appendChild(tr);
      });
    }
  };

  renderInnTable(match.innings1, 'inn1BattingTable', 'inn1BowlingTable', 'inn1TotalBadge');
  renderInnTable(match.innings2, 'inn2BattingTable', 'inn2BowlingTable', 'inn2TotalBadge');
}

function renderUserPointsTable() {
  const tour = appState.tournament;
  const tbody = document.querySelector('#pointsTable tbody');
  if (!tour || !tour.points_table || !tbody) return;

  tbody.innerHTML = '';
  tour.points_table.forEach((row, idx) => {
    const tr = document.createElement('tr');
    const formHtml = (row.form || []).map((f) => `<span class="form-pill ${f === 'W' ? 'win' : f === 'L' ? 'loss' : 'tie'}">${f}</span>`).join('');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${row.team_name}</strong></td>
      <td class="text-right">${row.played}</td>
      <td class="text-right">${row.won}</td>
      <td class="text-right">${row.lost}</td>
      <td class="text-right">${row.tied}</td>
      <td class="text-right"><strong>${row.points}</strong></td>
      <td class="text-right">${row.net_run_rate > 0 ? '+' : ''}${row.net_run_rate.toFixed(3)}</td>
      <td class="text-center">${formHtml || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderUserSchedule() {
  const tour = appState.tournament;
  const list = document.querySelector('#scheduleList');
  if (!tour || !tour.fixtures || !list) return;

  if (tour.schedule_mode === 'knockout') {
    renderKnockoutBracketTree('#knockoutBracketTreeContainer', tour.fixtures, tour.teams);
  }

  list.innerHTML = '';
  tour.fixtures.forEach((f) => {
    const isCompleted = f.status === 'completed' || f.is_completed;
    const card = document.createElement('div');
    card.className = `fixture-card ${isCompleted ? 'completed' : ''}`;
    card.innerHTML = `
      <div class="fixture-head">
        <span>${f.match_date || 'Match #' + f.match_number}</span>
        <span class="badge ${isCompleted ? 'badge-success' : 'badge-ghost'}">${isCompleted ? 'COMPLETED' : 'UPCOMING'}</span>
      </div>
      <div class="fixture-teams">
        <strong>${f.team1?.name || 'TBD'}</strong>
        <span class="vs">vs</span>
        <strong>${f.team2?.name || 'TBD'}</strong>
      </div>
      ${isCompleted && f.result_text ? `<div class="fixture-result">${f.result_text}</div>` : ''}
    `;
    list.appendChild(card);
  });
}

function renderUserTeams() {
  const tour = appState.tournament;
  const container = document.querySelector('#teamsContainer');
  if (!tour || !tour.teams || !container) return;

  container.innerHTML = '';
  tour.teams.forEach((team) => {
    const card = document.createElement('div');
    card.className = 'panel team-card';
    const playersHtml = (team.players || []).map((p, idx) => `
      <div class="team-player-row">
        <span>#${p.player_number || idx + 1} ${p.name} ${p.is_captain ? '(C)' : p.is_vice_captain ? '(VC)' : ''}</span>
        <small class="muted">${p.role || 'Player'}</small>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="panel-title">
        <div>
          <h3>${team.name}</h3>
          <small class="muted">${team.players?.length || 0} Players</small>
        </div>
      </div>
      <div class="team-players-list">${playersHtml}</div>
    `;
    container.appendChild(card);
  });
}

function renderUserLeaderboards() {
  const tour = appState.tournament;
  if (!tour) return;

  const allPlayers = [];
  tour.teams?.forEach((t) => {
    t.players?.forEach((p) => {
      allPlayers.push({ ...p, team: t.name });
    });
  });

  const orangeCap = document.querySelector('#orangeCapLeader');
  if (orangeCap && allPlayers.length > 0) {
    orangeCap.textContent = allPlayers[0].name || 'Arjun Mehta';
  }

  const purpleCap = document.querySelector('#purpleCapLeader');
  if (purpleCap && allPlayers.length > 1) {
    purpleCap.textContent = allPlayers[1].name || 'Dev Malhotra';
  }
}

function renderUserMatchSummary() {
  const match = appState.activeMatch;
  if (!match) return;

  const potmEl = document.querySelector('#summaryPotm');
  if (potmEl) {
    potmEl.textContent = match.awards?.potm?.name || 'Match in progress';
  }

  const exportBtn = document.querySelector('#exportScorecardBtn');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const txt = `
SCOREWIZZ OFFICIAL MATCH SCORECARD
Match: ${match.team1.name} vs ${match.team2.name}
Result: ${match.result_text || 'In Progress'}
1st Innings (${match.innings1.batting_team_name}): ${match.innings1.runs}/${match.innings1.wickets} (${Math.floor(match.innings1.balls / 6)}.${match.innings1.balls % 6} ov)
2nd Innings (${match.innings2.batting_team_name}): ${match.innings2.runs}/${match.innings2.wickets} (${Math.floor(match.innings2.balls / 6)}.${match.innings2.balls % 6} ov)
      `.trim();
      const blob = new Blob([txt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Scorecard_${match.team1.short_name}_vs_${match.team2.short_name}.txt`;
      a.click();
      showToast('Scorecard exported to TXT');
    };
  }
}

function renderUserTournamentsDirectory() {
  const container = document.querySelector('#tournamentsDirectoryGrid');
  if (!container) return;

  const tournaments = getAllTournamentsList();
  const filter = appState.tournamentFilter || 'all';

  const filtered = tournaments.filter((t) => {
    const status = getTournamentStatus(t);
    if (filter === 'running') return status === 'running';
    if (filter === 'completed') return status === 'completed';
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p class="muted" style="text-align: center; padding: 20px;">No tournaments found.</p>';
    return;
  }

  container.innerHTML = '';
  filtered.forEach((t) => {
    const isCurrent = appState.tournament?.id === t.id;
    const status = getTournamentStatus(t);
    const card = document.createElement('div');
    card.className = `tournament-dir-card ${isCurrent ? 'active-tournament' : ''}`;
    card.innerHTML = `
      <div class="dir-card-head">
        <div>
          <h4>${t.name}</h4>
          <small class="muted">${t.format || 'T20'} • ${t.overs || 20} Overs • ${t.teams?.length || 0} Teams</small>
        </div>
        <span class="badge ${status === 'completed' ? 'badge-success' : 'badge-primary'}">${status.toUpperCase()}</span>
      </div>
      <div class="dir-card-actions">
        <button class="btn btn-xs ${isCurrent ? 'btn-ghost' : 'btn-primary'}" data-user-view-tour="${t.id}">
          ${isCurrent ? 'Currently Viewing' : 'View Tournament'}
        </button>
      </div>
    `;

    card.querySelector('[data-user-view-tour]').onclick = () => {
      appState.tournament = t;
      if (t.fixtures && t.fixtures.length > 0) {
        initMatchFromFixture(t.fixtures[0]);
      }
      renderAllUserViews();
      switchUserView('scoreboard');
      showToast(`Viewing "${t.name}"`);
    };

    container.appendChild(card);
  });
}

// ----------------------------------------------------
// EVENT LISTENERS
// ----------------------------------------------------

function setupUserEventListeners() {
  document.querySelectorAll('[data-view]').forEach((link) => {
    link.onclick = (e) => {
      e.preventDefault();
      switchUserView(link.getAttribute('data-view'));
    };
  });

  document.querySelectorAll('.dir-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('.dir-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      appState.tournamentFilter = btn.getAttribute('data-filter') || 'all';
      renderUserTournamentsDirectory();
    };
  });
}
