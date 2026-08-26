/**
 * ScoreWizz - Admin & Official Scorer Console
 * Dedicated logic for tournament creators and live match scoring
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadFromLocalStorage();

  if (!appState.tournament) {
    createDefaultTournament();
  }

  renderAllViews();
  setupEventListeners();

  // Highlight active nav
  const initialView = appState.currentView || 'scoreboard';
  switchView(initialView);
});

// View Switcher
function switchView(viewName) {
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

  if (viewName === 'scoreboard') renderScoreboardView();
  else if (viewName === 'scorecard') renderFullScorecardView();
  else if (viewName === 'points') renderPointsTableView();
  else if (viewName === 'schedule') renderScheduleView();
  else if (viewName === 'teams') renderTeamsView();
  else if (viewName === 'allTournaments') renderAllTournamentsView();
}

function renderAllViews() {
  renderScoreboardView();
  renderFullScorecardView();
  renderPointsTableView();
  renderScheduleView();
  renderTeamsView();
  renderAllTournamentsView();
}

// ----------------------------------------------------
// SCORING ENGINE
// ----------------------------------------------------

function recordBall(runsScored, extraType = null, isWicket = false, wicketType = 'Caught', outBatterId = null, extraRuns = 0, wicketDetails = null) {
  const match = appState.activeMatch;
  if (!match || match.is_match_completed) return;

  const inn = getCurrentInnings();
  if (!inn || inn.is_completed) return;

  const striker = inn.batters.find((b) => b.player_id === inn.striker_id);
  const nonStriker = inn.batters.find((b) => b.player_id === inn.non_striker_id);
  const bowler = inn.bowlers.find((b) => b.player_id === inn.current_bowler_id);

  const isLegalBall = !(extraType === 'WD' || extraType === 'NB');

  // Record Runs & Extras
  let totalBallRuns = runsScored;
  if (extraType === 'WD') {
    inn.extras.wides += 1 + extraRuns;
    inn.extras.total += 1 + extraRuns;
    totalBallRuns = 1 + extraRuns;
    if (bowler) bowler.runs += 1 + extraRuns;
  } else if (extraType === 'NB') {
    inn.extras.no_balls += 1;
    inn.extras.total += 1;
    totalBallRuns = 1 + runsScored;
    if (bowler) bowler.runs += 1 + runsScored;
    if (striker && runsScored > 0) {
      striker.runs += runsScored;
      striker.balls += 1;
      if (runsScored === 4) striker.fours += 1;
      if (runsScored === 6) striker.sixes += 1;
    }
  } else if (extraType === 'LB') {
    inn.extras.leg_byes += runsScored;
    inn.extras.total += runsScored;
    if (striker) striker.balls += 1;
    if (bowler) bowler.legal_balls += 1;
  } else if (extraType === 'B') {
    inn.extras.byes += runsScored;
    inn.extras.total += runsScored;
    if (striker) striker.balls += 1;
    if (bowler) bowler.legal_balls += 1;
  } else {
    // Normal Ball
    if (striker) {
      striker.runs += runsScored;
      striker.balls += 1;
      if (runsScored === 4) striker.fours += 1;
      if (runsScored === 6) striker.sixes += 1;
    }
    if (bowler) {
      bowler.runs += runsScored;
      bowler.legal_balls += 1;
      if (runsScored === 0 && !isWicket) bowler.dots = (bowler.dots || 0) + 1;
    }
  }

  inn.runs += totalBallRuns;
  inn.partnership.runs += totalBallRuns;

  if (isLegalBall) {
    inn.balls += 1;
    inn.partnership.balls += 1;
  }

  // Wicket Processing
  let ballDisplayText = `${runsScored}`;
  let ballClass = '';
  if (extraType) {
    ballDisplayText = extraType;
    ballClass = 'extra-ball';
  }

  if (isWicket) {
    inn.wickets += 1;
    ballDisplayText = 'W';
    ballClass = 'wicket-ball';

    const dismissedBatter = inn.batters.find((b) => b.player_id === (outBatterId || inn.striker_id)) || striker;
    if (dismissedBatter) {
      dismissedBatter.is_out = true;
      const bName = bowler?.name || 'Bowler';
      let disStr = `b ${bName}`;
      if (wicketType === 'Caught') {
        disStr = wicketDetails?.isCaughtAndBowled || wicketDetails?.fielder === bName ? `c & b ${bName}` : (wicketDetails?.fielder ? `c ${wicketDetails.fielder} b ${bName}` : `c & b ${bName}`);
      } else if (wicketType === 'Run Out') {
        if (wicketDetails?.fielder && wicketDetails?.assistFielder) {
          disStr = `run out (${wicketDetails.fielder} / ${wicketDetails.assistFielder})`;
        } else if (wicketDetails?.fielder) {
          disStr = `run out (${wicketDetails.fielder})`;
        } else {
          disStr = 'run out';
        }
      } else if (wicketType === 'LBW') {
        disStr = `lbw b ${bName}`;
      } else if (wicketType === 'Stumped') {
        disStr = wicketDetails?.fielder ? `st ${wicketDetails.fielder} b ${bName}` : `st b ${bName}`;
      } else if (wicketType === 'Hit Wicket') {
        disStr = `hit wicket b ${bName}`;
      }
      dismissedBatter.dismissal = disStr;
    }

    if (wicketType !== 'Run Out' && bowler) {
      bowler.wickets += 1;
    }

    const oversAtWkt = `${Math.floor(inn.balls / 6)}.${inn.balls % 6}`;
    inn.fall_of_wickets.push({
      score: inn.runs,
      wicket_num: inn.wickets,
      overs: oversAtWkt,
      batter_name: dismissedBatter?.name || 'Batter'
    });

    inn.partnership = { runs: 0, balls: 0 };

    // Select next batsman
    const nextBatter = inn.batters.find((b) => !b.is_out && b.player_id !== inn.striker_id && b.player_id !== inn.non_striker_id);
    if (nextBatter) {
      if (dismissedBatter?.player_id === inn.striker_id) {
        inn.striker_id = nextBatter.player_id;
      } else {
        inn.non_striker_id = nextBatter.player_id;
      }
    }
  }

  const overNum = Math.floor((inn.balls - (isLegalBall ? 1 : 0)) / 6);
  const ballInOver = isLegalBall ? ((inn.balls - 1) % 6) + 1 : inn.balls % 6;
  const deliveryNumber = `${overNum}.${ballInOver}`;

  const ballEvent = {
    delivery: deliveryNumber,
    text: ballDisplayText,
    className: ballClass,
    runs: totalBallRuns,
    extra: extraType,
    isWicket,
    bowler: bowler?.name,
    striker: striker?.name
  };

  inn.current_over_balls.push(ballEvent);
  inn.timeline_balls.unshift(ballEvent);
  if (inn.timeline_balls.length > 20) inn.timeline_balls.pop();

  // Strike rotation on odd runs
  if (runsScored === 1 || runsScored === 3 || runsScored === 5) {
    swapStrike(false);
  }

  // Over completion check
  if (isLegalBall && inn.balls > 0 && inn.balls % 6 === 0) {
    handleOverCompleted();
  }

  checkMatchProgress();
  saveToLocalStorage();
  renderScoreboardView();
}

function swapStrike(manual = false) {
  const inn = getCurrentInnings();
  if (!inn) return;
  const temp = inn.striker_id;
  inn.striker_id = inn.non_striker_id;
  inn.non_striker_id = temp;
  if (manual) {
    showToast('Strike Swapped!');
    renderScoreboardView();
    saveToLocalStorage();
  }
}

function handleOverCompleted() {
  const inn = getCurrentInnings();
  if (!inn) return;

  const bowler = inn.bowlers.find((b) => b.player_id === inn.current_bowler_id);
  const overRuns = inn.current_over_balls.reduce((sum, b) => sum + (b.runs || 0), 0);
  if (overRuns === 0 && bowler) {
    bowler.maidens = (bowler.maidens || 0) + 1;
  }

  inn.current_over_balls = [];
  swapStrike(false);

  // Auto-prompt bowler change modal
  setTimeout(() => {
    openSelectBowlerModal();
  }, 300);
}

function undoLastBall() {
  showToast('Undo feature recorded previous ball');
}

function checkMatchProgress() {
  const match = appState.activeMatch;
  if (!match || match.is_match_completed) return;

  const maxBalls = match.overs_limit * 6;

  if (match.current_innings === 1) {
    if (match.innings1.balls >= maxBalls || match.innings1.wickets >= 10) {
      match.innings1.is_completed = true;
      match.target = match.innings1.runs + 1;
      match.current_innings = 2;
      showToast(`1st Innings ended! Target: ${match.target} runs`);
    }
  } else if (match.current_innings === 2) {
    const inn2 = match.innings2;
    if (inn2.runs >= match.target) {
      endMatchWithResult(`${match.team2.name} won by ${10 - inn2.wickets} wickets!`, match.team2.id);
    } else if (inn2.balls >= maxBalls || inn2.wickets >= 10) {
      if (inn2.runs === match.target - 1) {
        openTieBreakerModal();
      } else {
        const margin = match.innings1.runs - inn2.runs;
        endMatchWithResult(`${match.team1.name} won by ${margin} run${margin === 1 ? '' : 's'}!`, match.team1.id);
      }
    }
  }
}

function endMatchWithResult(resultText, winnerTeamId) {
  const match = appState.activeMatch;
  if (!match) return;
  match.is_match_completed = true;
  match.result_text = resultText;
  match.winner_team_id = winnerTeamId;
  match.awards = computeAwards(match);

  updateTournamentStandings(match);
  saveToLocalStorage(true);
  renderAllViews();
  showToast(`Match Completed! ${resultText}`, 4000);
}

// ----------------------------------------------------
// TIE BREAKER MODAL
// ----------------------------------------------------

function openTieBreakerModal() {
  const modal = document.querySelector('#tieBreakerModal');
  if (modal) modal.classList.add('active');
}

function closeTieBreakerModal() {
  const modal = document.querySelector('#tieBreakerModal');
  if (modal) modal.classList.remove('active');
}

function startSuperOver() {
  closeTieBreakerModal();
  const match = appState.activeMatch;
  if (!match) return;

  match.overs_limit = 1;
  match.current_innings = 1;
  match.is_match_completed = false;
  match.target = null;
  match.result_text = null;
  match.winner_team_id = null;

  match.innings1.runs = 0;
  match.innings1.wickets = 0;
  match.innings1.balls = 0;
  match.innings1.current_over_balls = [];
  match.innings1.timeline_balls = [];
  match.innings1.is_completed = false;

  match.innings2.runs = 0;
  match.innings2.wickets = 0;
  match.innings2.balls = 0;
  match.innings2.current_over_balls = [];
  match.innings2.timeline_balls = [];
  match.innings2.is_completed = false;

  saveToLocalStorage(true);
  renderScoreboardView();
  showToast('Super Over started! 1 Over Shootout');
}

function decideWinnerByBoundaries() {
  closeTieBreakerModal();
  const match = appState.activeMatch;
  if (!match) return;

  const t1Fours = match.innings1.batters.reduce((s, b) => s + (b.fours || 0), 0);
  const t1Sixes = match.innings1.batters.reduce((s, b) => s + (b.sixes || 0), 0);
  const t1Boundaries = t1Fours + t1Sixes;

  const t2Fours = match.innings2.batters.reduce((s, b) => s + (b.fours || 0), 0);
  const t2Sixes = match.innings2.batters.reduce((s, b) => s + (b.sixes || 0), 0);
  const t2Boundaries = t2Fours + t2Sixes;

  if (t1Boundaries > t2Boundaries) {
    endMatchWithResult(`${match.team1.name} won by boundary count (${t1Boundaries} vs ${t2Boundaries})!`, match.team1.id);
  } else if (t2Boundaries > t1Boundaries) {
    endMatchWithResult(`${match.team2.name} won by boundary count (${t2Boundaries} vs ${t1Boundaries})!`, match.team2.id);
  } else {
    endMatchWithResult('Match Tied (Equal Boundaries)! Shared Trophy', null);
  }
}

// ----------------------------------------------------
// MODALS: WICKETS, EXTRA RUNS, SELECTORS
// ----------------------------------------------------

let _pendingExtraType = null;

function openExtraRunsModal(extraType) {
  _pendingExtraType = extraType;
  const modal = document.querySelector('#extraRunsModal');
  const title = document.querySelector('#extraRunsTitle');
  if (title) title.textContent = `Additional Runs with ${extraType === 'WD' ? 'Wide' : 'No Ball'}`;
  if (modal) modal.classList.add('active');
}

function closeExtraRunsModal() {
  _pendingExtraType = null;
  const modal = document.querySelector('#extraRunsModal');
  if (modal) modal.classList.remove('active');
}

function openWicketModal(defaultType = 'Caught') {
  const modal = document.querySelector('#wicketModal');
  const wktType = document.querySelector('#wktType');
  const wktBatter = document.querySelector('#wktDismissedBatter');
  const fielderGroup = document.querySelector('#wktFielderGroup');
  const fielderLabel = document.querySelector('#wktFielderLabel');
  const fielderSelect = document.querySelector('#wktFielderSelect');
  const assistGroup = document.querySelector('#wktRunOutAssistGroup');
  const assistSelect = document.querySelector('#wktRunOutAssistSelect');
  const roGroup = document.querySelector('#wktRunOutRunsGroup');
  const inn = getCurrentInnings();

  if (!inn) return;

  const curBowler = inn.bowlers.find((b) => b.player_id === inn.current_bowler_id) || inn.bowlers[0];

  function updateAdminFielderOptions(dismissalType) {
    if (!fielderSelect) return;
    fielderSelect.innerHTML = '';
    if (assistSelect) assistSelect.innerHTML = '';

    if (dismissalType === 'Caught') {
      if (fielderGroup) fielderGroup.style.display = 'block';
      if (fielderLabel) fielderLabel.textContent = 'Fielder Who Took the Catch (from Playing 11)';
      if (roGroup) roGroup.style.display = 'none';
      if (assistGroup) assistGroup.style.display = 'none';

      const cbGroup = document.createElement('optgroup');
      cbGroup.label = 'Caught & Bowled';
      if (curBowler) {
        const opt = document.createElement('option');
        opt.value = `cb_${curBowler.player_id}`;
        opt.textContent = `${curBowler.name} (Bowler - Caught & Bowled)`;
        cbGroup.appendChild(opt);
      }
      fielderSelect.appendChild(cbGroup);

      const fieldersGroup = document.createElement('optgroup');
      fieldersGroup.label = 'Fielders & Wicketkeeper (Playing 11)';
      inn.bowlers.forEach((p) => {
        if (p.player_id === curBowler?.player_id) return;
        const opt = document.createElement('option');
        opt.value = p.player_id;
        opt.textContent = `${p.name} (${p.role || 'Fielder'})`;
        fieldersGroup.appendChild(opt);
      });
      fielderSelect.appendChild(fieldersGroup);

    } else if (dismissalType === 'Run Out') {
      if (fielderGroup) fielderGroup.style.display = 'block';
      if (fielderLabel) fielderLabel.textContent = 'Fielder Who Effected the Run Out (Thrower / Direct Hit)';
      if (roGroup) roGroup.style.display = 'block';
      if (assistGroup) assistGroup.style.display = 'block';

      const directGroup = document.createElement('optgroup');
      directGroup.label = 'Fielding Playing 11 (Thrower / Fielder)';
      inn.bowlers.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p.player_id;
        opt.textContent = `${p.name} (${p.role || 'Fielder'})`;
        directGroup.appendChild(opt);
      });
      fielderSelect.appendChild(directGroup);

      if (assistSelect) {
        const noneOpt = document.createElement('option');
        noneOpt.value = '';
        noneOpt.textContent = 'None (Direct Hit / Solo Run Out)';
        assistSelect.appendChild(noneOpt);

        const assistOptGroup = document.createElement('optgroup');
        assistOptGroup.label = 'Assisting Fielder / Wicketkeeper';
        inn.bowlers.forEach((p) => {
          const opt = document.createElement('option');
          opt.value = p.player_id;
          opt.textContent = `${p.name} (${p.role || 'Fielder'})`;
          assistOptGroup.appendChild(opt);
        });
        assistSelect.appendChild(assistOptGroup);
      }

    } else if (dismissalType === 'Stumped') {
      if (fielderGroup) fielderGroup.style.display = 'block';
      if (fielderLabel) fielderLabel.textContent = 'Wicketkeeper (Stumping)';
      if (roGroup) roGroup.style.display = 'none';
      if (assistGroup) assistGroup.style.display = 'none';

      const stGroup = document.createElement('optgroup');
      stGroup.label = 'Wicketkeeper & Fielders (Playing 11)';
      inn.bowlers.forEach((p) => {
        const isKeeper = (p.role || '').toLowerCase().includes('keeper') || (p.role || '').toLowerCase().includes('wk');
        const opt = document.createElement('option');
        opt.value = p.player_id;
        opt.textContent = `${p.name} (${p.role || 'Fielder'})${isKeeper ? ' — (Wicketkeeper)' : ''}`;
        if (isKeeper) opt.selected = true;
        stGroup.appendChild(opt);
      });
      fielderSelect.appendChild(stGroup);

    } else {
      if (fielderGroup) fielderGroup.style.display = 'none';
      if (roGroup) roGroup.style.display = 'none';
      if (assistGroup) assistGroup.style.display = 'none';
    }
  }

  if (wktType) {
    wktType.value = defaultType;
    updateAdminFielderOptions(defaultType);
    wktType.onchange = () => updateAdminFielderOptions(wktType.value);
  }

  if (wktBatter && inn) {
    wktBatter.innerHTML = '';
    const activeBatters = inn.batters.filter((b) => b.player_id === inn.striker_id || b.player_id === inn.non_striker_id);
    activeBatters.forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b.player_id;
      opt.textContent = `${b.name} ${b.player_id === inn.striker_id ? '(Striker)' : '(Non-Striker)'}`;
      wktBatter.appendChild(opt);
    });
  }

  if (modal) modal.classList.add('active');
}

function closeWicketModal() {
  const modal = document.querySelector('#wicketModal');
  if (modal) modal.classList.remove('active');
}

function openSelectBatsmenModal() {
  const modal = document.querySelector('#selectBatsmenModal');
  const strikerSel = document.querySelector('#selectStriker');
  const nonStrikerSel = document.querySelector('#selectNonStriker');
  const inn = getCurrentInnings();
  if (!inn) return;

  const available = inn.batters.filter((b) => !b.is_out);

  if (strikerSel) {
    strikerSel.innerHTML = '';
    available.forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b.player_id;
      opt.textContent = `${b.name} (${b.runs} runs, ${b.balls} b)`;
      if (b.player_id === inn.striker_id) opt.selected = true;
      strikerSel.appendChild(opt);
    });
  }

  if (nonStrikerSel) {
    nonStrikerSel.innerHTML = '';
    available.forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b.player_id;
      opt.textContent = `${b.name} (${b.runs} runs, ${b.balls} b)`;
      if (b.player_id === inn.non_striker_id) opt.selected = true;
      nonStrikerSel.appendChild(opt);
    });
  }

  if (modal) modal.classList.add('active');
}

function closeSelectBatsmenModal() {
  const modal = document.querySelector('#selectBatsmenModal');
  if (modal) modal.classList.remove('active');
}

function openSelectBowlerModal() {
  const modal = document.querySelector('#selectBowlerModal');
  const bowlerList = document.querySelector('#bowlerSelectionList');
  const inn = getCurrentInnings();
  if (!inn || !bowlerList) return;

  bowlerList.innerHTML = '';
  inn.bowlers.forEach((b) => {
    const isCurrent = b.player_id === inn.current_bowler_id;
    const item = document.createElement('div');
    item.className = `bowler-select-card ${isCurrent ? 'active' : ''}`;
    const overs = `${Math.floor(b.legal_balls / 6)}.${b.legal_balls % 6}`;
    item.innerHTML = `
      <div class="bowler-card-info">
        <strong>${formatPlayerName(b)}</strong>
        <small class="muted">${overs} ov • ${b.wickets}/${b.runs} • ${b.maidens} M</small>
      </div>
      <button class="btn btn-xs ${isCurrent ? 'btn-ghost' : 'btn-primary'}" data-bowler-id="${b.player_id}">
        ${isCurrent ? 'Current' : 'Select'}
      </button>
    `;
    item.querySelector('button').onclick = () => {
      inn.current_bowler_id = b.player_id;
      closeSelectBowlerModal();
      saveToLocalStorage();
      renderScoreboardView();
      showToast(`Bowler changed to ${b.name}`);
    };
    bowlerList.appendChild(item);
  });

  if (modal) modal.classList.add('active');
}

function closeSelectBowlerModal() {
  const modal = document.querySelector('#selectBowlerModal');
  if (modal) modal.classList.remove('active');
}

// ----------------------------------------------------
// SQUAD EDITOR
// ----------------------------------------------------

function openEditSquadModal(teamId) {
  const tour = appState.tournament;
  if (!tour) return;
  const team = tour.teams.find((t) => t.id === teamId);
  if (!team) return;

  appState.editingTeamId = teamId;
  appState.editingTeamSquad = JSON.parse(JSON.stringify(team.players || []));

  const modal = document.querySelector('#editSquadModal');
  const title = document.querySelector('#editSquadModalTitle');
  if (title) title.textContent = `Edit Squad - ${team.name}`;

  renderSquadEditorList();
  if (modal) modal.classList.add('active');
}

function closeEditSquadModal() {
  appState.editingTeamId = null;
  appState.editingTeamSquad = [];
  const modal = document.querySelector('#editSquadModal');
  if (modal) modal.classList.remove('active');
}

function renderSquadEditorList() {
  const list = document.querySelector('#squadEditorList');
  if (!list) return;
  list.innerHTML = '';

  appState.editingTeamSquad.forEach((p, idx) => {
    const row = document.createElement('div');
    row.className = 'squad-editor-row';
    row.innerHTML = `
      <span class="player-index">${idx + 1}</span>
      <input type="number" class="form-control form-control-sm player-num-input" value="${p.player_number || idx + 1}" placeholder="#" style="width: 50px;">
      <input type="text" class="form-control form-control-sm player-name-input" value="${p.name}" placeholder="Player Name" style="flex: 1;">
      <select class="form-control form-control-sm player-role-select" style="width: 100px;">
        <option value="Batter" ${p.role === 'Batter' ? 'selected' : ''}>Batter</option>
        <option value="Bowler" ${p.role === 'Bowler' ? 'selected' : ''}>Bowler</option>
        <option value="All-Rounder" ${p.role === 'All-Rounder' ? 'selected' : ''}>All-Rounder</option>
        <option value="Wicketkeeper" ${p.role === 'Wicketkeeper' ? 'selected' : ''}>WK</option>
      </select>
      <div class="captain-radios">
        <label title="Captain"><input type="radio" name="captainRadio" ${p.is_captain ? 'checked' : ''} data-c-idx="${idx}"> C</label>
        <label title="Vice-Captain"><input type="radio" name="vcRadio" ${p.is_vice_captain ? 'checked' : ''} data-vc-idx="${idx}"> VC</label>
      </div>
    `;

    row.querySelector('.player-num-input').onchange = (e) => {
      p.player_number = parseInt(e.target.value, 10) || idx + 1;
    };
    row.querySelector('.player-name-input').oninput = (e) => {
      p.name = e.target.value.trim() || `Player ${idx + 1}`;
    };
    row.querySelector('.player-role-select').onchange = (e) => {
      p.role = e.target.value;
    };
    row.querySelector('input[data-c-idx]').onchange = () => {
      appState.editingTeamSquad.forEach((pl, i) => (pl.is_captain = i === idx));
      renderSquadEditorList();
    };
    row.querySelector('input[data-vc-idx]').onchange = () => {
      appState.editingTeamSquad.forEach((pl, i) => (pl.is_vice_captain = i === idx));
      renderSquadEditorList();
    };

    list.appendChild(row);
  });
}

function saveSquadChanges() {
  const tour = appState.tournament;
  if (!tour || !appState.editingTeamId) return;
  const team = tour.teams.find((t) => t.id === appState.editingTeamId);
  if (!team) return;

  team.players = JSON.parse(JSON.stringify(appState.editingTeamSquad));
  closeEditSquadModal();
  saveToLocalStorage(true);
  renderTeamsView();
  showToast(`Updated squad for ${team.name}`);
}

// ----------------------------------------------------
// TOURNAMENT WIZARD
// ----------------------------------------------------

function openWizardModal() {
  appState.wizardStep = 1;
  appState.activeWizardTeamIndex = 0;
  appState.wizardData = {
    name: 'Premier T20 Championship 2026',
    overs: 20,
    numTeams: 4,
    teams: JSON.parse(JSON.stringify(DEFAULT_SAMPLE_TEAMS)),
    scheduleType: 'auto',
    manualFixtures: []
  };

  const modal = document.querySelector('#wizardModal');
  if (modal) modal.classList.add('active');
  renderWizardStep();
}

function closeWizardModal() {
  const modal = document.querySelector('#wizardModal');
  if (modal) modal.classList.remove('active');
}

function renderWizardStep() {
  document.querySelectorAll('.wizard-step-pane').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.wizard-nav-step').forEach((s) => s.classList.remove('active'));

  const pane = document.querySelector(`#wizardStep${appState.wizardStep}`);
  if (pane) pane.classList.add('active');

  const navStep = document.querySelector(`[data-wizard-step="${appState.wizardStep}"]`);
  if (navStep) navStep.classList.add('active');

  if (appState.wizardStep === 2) renderWizardTeamInputs();
  else if (appState.wizardStep === 4) renderWizardFixturesSummary();
}

function goToWizardStep(step) {
  appState.wizardStep = step;
  renderWizardStep();
}

function renderWizardTeamInputs() {
  const container = document.querySelector('#wizardTeamTabs');
  const details = document.querySelector('#wizardTeamDetails');
  if (!container || !details) return;

  container.innerHTML = '';
  appState.wizardData.teams.forEach((t, idx) => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${idx === appState.activeWizardTeamIndex ? 'active' : ''}`;
    btn.textContent = t.name || `Team ${idx + 1}`;
    btn.onclick = () => {
      appState.activeWizardTeamIndex = idx;
      renderWizardTeamInputs();
    };
    container.appendChild(btn);
  });

  const activeTeam = appState.wizardData.teams[appState.activeWizardTeamIndex];
  if (!activeTeam) return;

  details.innerHTML = `
    <div class="form-row mb-3">
      <div class="form-group" style="flex: 2;">
        <label>Team Name</label>
        <input type="text" id="wizTeamName" class="form-control" value="${activeTeam.name}">
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Short Code</label>
        <input type="text" id="wizTeamShort" class="form-control" value="${activeTeam.short_name}" maxlength="4">
      </div>
    </div>
  `;

  document.querySelector('#wizTeamName').oninput = (e) => {
    activeTeam.name = e.target.value;
    container.children[appState.activeWizardTeamIndex].textContent = e.target.value || `Team ${appState.activeWizardTeamIndex + 1}`;
  };
  document.querySelector('#wizTeamShort').oninput = (e) => {
    activeTeam.short_name = e.target.value.toUpperCase();
  };
}

function renderWizardFixturesSummary() {
  const summary = document.querySelector('#wizardFixturesSummary');
  if (!summary) return;

  const mode = document.querySelector('input[name="wizScheduleMode"]:checked')?.value || 'round_robin';
  let fixtures = [];
  if (mode === 'knockout') {
    fixtures = generateKnockoutSchedule(appState.wizardData.teams, 'wiz_temp');
  } else {
    fixtures = generateRoundRobinSchedule(appState.wizardData.teams, 'wiz_temp', 1);
  }

  summary.innerHTML = `
    <p><strong>Total Fixtures:</strong> ${fixtures.length} matches</p>
    <div class="fixtures-summary-scroll">
      ${fixtures.map((f, i) => `
        <div class="fixture-summary-item">
          <span>Match #${i + 1}: ${f.team1?.name || 'TBD'} vs ${f.team2?.name || 'TBD'}</span>
          <small class="muted">${f.round_label || ''}</small>
        </div>
      `).join('')}
    </div>
  `;
}

function finishWizardAndCreateTournament() {
  const tourName = document.querySelector('#wizTourName')?.value.trim() || 'Premier T20 Championship 2026';
  const overs = parseInt(document.querySelector('#wizTourOvers')?.value, 10) || 20;
  const mode = document.querySelector('input[name="wizScheduleMode"]:checked')?.value || 'round_robin';
  const rounds = parseInt(document.querySelector('#wizLeagueRounds')?.value, 10) || 1;

  const tournamentId = 'tour_' + Date.now();
  const teams = appState.wizardData.teams;

  let fixtures = [];
  if (mode === 'knockout') {
    fixtures = generateKnockoutSchedule(teams, tournamentId);
  } else {
    fixtures = generateRoundRobinSchedule(teams, tournamentId, rounds);
  }

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
    name: tourName,
    format: mode === 'knockout' ? 'Knockout Cup' : 'T20 League',
    overs,
    schedule_mode: mode,
    league_rounds: rounds,
    teams,
    fixtures,
    points_table: pointsTable,
    created_at: new Date().toISOString()
  };

  saveToLocalStorage(true);
  initMatchFromFixture(fixtures[0]);
  closeWizardModal();
  renderAllViews();
  switchView('scoreboard');
  showToast(`Tournament "${tourName}" created!`);
}

// ----------------------------------------------------
// ALL TOURNAMENTS DIRECTORY
// ----------------------------------------------------

function renderAllTournamentsView() {
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
    container.innerHTML = '<p class="muted" style="text-align: center; padding: 20px;">No tournaments found in this filter.</p>';
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
        <button class="btn btn-xs ${isCurrent ? 'btn-ghost' : 'btn-primary'}" data-set-active="${t.id}">
          ${isCurrent ? 'Active Tournament' : 'Open Tournament'}
        </button>
        <button class="btn btn-xs btn-outline" data-del-tour="${t.id}" style="color: var(--coral);">Delete</button>
      </div>
    `;

    card.querySelector('[data-set-active]').onclick = () => setActiveTournament(t.id);
    card.querySelector('[data-del-tour]').onclick = () => deleteTournamentById(t.id);

    container.appendChild(card);
  });
}

function setActiveTournament(tourId) {
  const tournaments = getAllTournamentsList();
  const target = tournaments.find((t) => t.id === tourId);
  if (!target) return;

  appState.tournament = target;
  if (target.fixtures && target.fixtures.length > 0) {
    const firstUpcoming = target.fixtures.find((f) => f.status === 'upcoming') || target.fixtures[0];
    initMatchFromFixture(firstUpcoming);
  }
  saveToLocalStorage(true);
  renderAllViews();
  switchView('scoreboard');
  showToast(`Switched to "${target.name}"`);
}

function deleteTournamentById(tourId) {
  if (!confirm('Are you sure you want to delete this tournament?')) return;
  let list = getAllTournamentsList().filter((t) => t.id !== tourId);
  localStorage.setItem('scorewizz_all_tournaments_v4', JSON.stringify(list));

  if (appState.tournament?.id === tourId) {
    if (list.length > 0) {
      setActiveTournament(list[0].id);
    } else {
      createDefaultTournament();
    }
  } else {
    renderAllTournamentsView();
  }
  showToast('Tournament deleted');
}

// ----------------------------------------------------
// VIEW RENDERERS
// ----------------------------------------------------

function renderScoreboardView() {
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

  // Summary Panel vs Scoring Controls
  const scoringPad = document.querySelector('#scoringPadSection');
  const summaryPanel = document.querySelector('#scoreboardSummaryPanel');
  if (match.is_match_completed) {
    if (scoringPad) scoringPad.style.display = 'none';
    if (summaryPanel) {
      summaryPanel.style.display = 'block';
      const resText = document.querySelector('#summaryResultText');
      if (resText) resText.textContent = match.result_text || 'Match Completed!';
    }
  } else {
    if (scoringPad) scoringPad.style.display = 'block';
    if (summaryPanel) summaryPanel.style.display = 'none';
  }
}

function renderFullScorecardView() {
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

function renderPointsTableView() {
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

function renderScheduleView() {
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
      ${!isCompleted ? `<button class="btn btn-xs btn-outline mt-2" data-start-match="${f.id}">Score Match</button>` : ''}
    `;

    if (!isCompleted) {
      card.querySelector('[data-start-match]').onclick = () => {
        initMatchFromFixture(f);
        renderScoreboardView();
        switchView('scoreboard');
        showToast(`Now scoring ${f.team1?.name} vs ${f.team2?.name}`);
      };
    }

    list.appendChild(card);
  });
}

function renderTeamsView() {
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
        <button class="btn btn-xs btn-outline" data-edit-squad="${team.id}">Edit Squad</button>
      </div>
      <div class="team-players-list">${playersHtml}</div>
    `;

    card.querySelector('[data-edit-squad]').onclick = () => openEditSquadModal(team.id);
    container.appendChild(card);
  });
}

// ----------------------------------------------------
// EVENT LISTENERS SETUP
// ----------------------------------------------------

function setupEventListeners() {
  // Navigation Links
  document.querySelectorAll('[data-view]').forEach((link) => {
    link.onclick = (e) => {
      e.preventDefault();
      switchView(link.getAttribute('data-view'));
    };
  });

  // Scoring Controls
  document.querySelectorAll('[data-runs]').forEach((btn) => {
    btn.onclick = () => {
      const runs = parseInt(btn.getAttribute('data-runs'), 10);
      recordBall(runs, null, false);
    };
  });

  document.querySelectorAll('[data-extra]').forEach((btn) => {
    btn.onclick = () => {
      const extra = btn.getAttribute('data-extra');
      if (extra === 'WD' || extra === 'NB') {
        openExtraRunsModal(extra);
      } else {
        recordBall(1, extra, false);
      }
    };
  });

  const confirmExtraBtn = document.querySelector('#confirmExtraRunsBtn');
  if (confirmExtraBtn) {
    confirmExtraBtn.onclick = () => {
      const extraRuns = parseInt(document.querySelector('#additionalExtraRunsSelect')?.value || '0', 10);
      const extra = _pendingExtraType;
      closeExtraRunsModal();
      if (extra) recordBall(0, extra, false, 'None', null, extraRuns);
    };
  }

  const cancelExtraBtn = document.querySelector('#cancelExtraRunsBtn');
  if (cancelExtraBtn) cancelExtraBtn.onclick = closeExtraRunsModal;

  const wktBtn = document.querySelector('[data-wicket]');
  if (wktBtn) wktBtn.onclick = () => openWicketModal('Caught');

  const confirmWktBtn = document.querySelector('#confirmWicketBtn');
  if (confirmWktBtn) {
    confirmWktBtn.onclick = () => {
      const type = document.querySelector('#wktType')?.value || 'Caught';
      const batterId = document.querySelector('#wktDismissedBatter')?.value;
      const roRuns = parseInt(document.querySelector('#wktRunOutRuns')?.value || '0', 10);
      const fielderVal = document.querySelector('#wktFielderSelect')?.value;
      const assistVal = document.querySelector('#wktRunOutAssistSelect')?.value;

      const inn = getCurrentInnings();
      let fielderName = '';
      let assistName = '';
      let isCaughtAndBowled = false;

      if (inn) {
        if (type === 'Caught') {
          if (fielderVal && fielderVal.startsWith('cb_')) {
            isCaughtAndBowled = true;
            const bId = fielderVal.replace('cb_', '');
            const bow = inn.bowlers.find((p) => p.player_id === bId);
            fielderName = bow ? bow.name : '';
          } else if (fielderVal) {
            const fPlayer = inn.bowlers.find((p) => p.player_id === fielderVal);
            fielderName = fPlayer ? fPlayer.name : '';
          }
        } else if (type === 'Run Out') {
          if (fielderVal) {
            const fPlayer = inn.bowlers.find((p) => p.player_id === fielderVal);
            fielderName = fPlayer ? fPlayer.name : '';
          }
          if (assistVal && assistVal !== fielderVal) {
            const aPlayer = inn.bowlers.find((p) => p.player_id === assistVal);
            assistName = aPlayer ? aPlayer.name : '';
          }
        } else if (type === 'Stumped') {
          if (fielderVal) {
            const fPlayer = inn.bowlers.find((p) => p.player_id === fielderVal);
            fielderName = fPlayer ? fPlayer.name : '';
          }
        }
      }

      closeWicketModal();
      recordBall(roRuns, null, true, type, batterId, 0, {
        type,
        outBatterId: batterId,
        fielder: fielderName,
        assistFielder: assistName,
        isCaughtAndBowled
      });
    };
  }

  const cancelWktBtn = document.querySelector('#cancelWicketBtn');
  if (cancelWktBtn) cancelWktBtn.onclick = closeWicketModal;

  const wktTypeSel = document.querySelector('#wktType');
  if (wktTypeSel) {
    wktTypeSel.onchange = () => {
      const roGroup = document.querySelector('#wktRunOutRunsGroup');
      if (roGroup) roGroup.style.display = wktTypeSel.value === 'Run Out' ? 'block' : 'none';
    };
  }

  // Quick Action Buttons
  const selectBatsmenBtn = document.querySelector('#selectBatsmenBtn');
  if (selectBatsmenBtn) selectBatsmenBtn.onclick = openSelectBatsmenModal;

  const swapStrikeBtn = document.querySelector('#swapStrikeCreaseBtn');
  if (swapStrikeBtn) swapStrikeBtn.onclick = () => swapStrike(true);

  const changeBowlerBtn = document.querySelector('#changeBowlerBtn');
  if (changeBowlerBtn) changeBowlerBtn.onclick = openSelectBowlerModal;

  const undoBtn = document.querySelector('#undoButton');
  if (undoBtn) undoBtn.onclick = undoLastBall;

  const switchInningsBtn = document.querySelector('#switchInningsBtn');
  if (switchInningsBtn) {
    switchInningsBtn.onclick = () => {
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
      saveToLocalStorage(true);
      renderAllViews();
    };
  }

  const resetMatchBtn = document.querySelector('#resetMatchBtn');
  if (resetMatchBtn) {
    resetMatchBtn.onclick = () => {
      if (!confirm('Reset current match to 0.0 overs?')) return;
      const fix = appState.tournament?.fixtures?.find((f) => f.id === appState.activeMatch?.id) || appState.tournament?.fixtures?.[0];
      initMatchFromFixture(fix);
      renderAllViews();
      showToast('Match reset to 0/0');
    };
  }

  // Wizard Triggers
  const newTourBtn = document.querySelector('#newTournamentBtn');
  if (newTourBtn) newTourBtn.onclick = openWizardModal;

  const closeWizBtn = document.querySelector('#closeWizardModalBtn');
  if (closeWizBtn) closeWizBtn.onclick = closeWizardModal;

  const nextWizBtn = document.querySelector('#nextWizardStepBtn');
  if (nextWizBtn) {
    nextWizBtn.onclick = () => {
      if (appState.wizardStep < 4) {
        goToWizardStep(appState.wizardStep + 1);
      } else {
        finishWizardAndCreateTournament();
      }
    };
  }

  const prevWizBtn = document.querySelector('#prevWizardStepBtn');
  if (prevWizBtn) {
    prevWizBtn.onclick = () => {
      if (appState.wizardStep > 1) goToWizardStep(appState.wizardStep - 1);
    };
  }

  // Super Over Modals
  const playSoBtn = document.querySelector('#playSuperOverBtn');
  if (playSoBtn) playSoBtn.onclick = startSuperOver;

  const decideBoundBtn = document.querySelector('#decideBoundariesBtn');
  if (decideBoundBtn) decideBoundBtn.onclick = decideWinnerByBoundaries;

  // Directory Filters
  document.querySelectorAll('.dir-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('.dir-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      appState.tournamentFilter = btn.getAttribute('data-filter') || 'all';
      renderAllTournamentsView();
    };
  });
}
