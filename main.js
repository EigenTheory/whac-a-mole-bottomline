;(function (window, document, undefined) {
  'use strict';

  const Scoreboard = (function () {
    const _defaults = {
      duration: 10000,
      scoreElem: document.querySelectorAll('[data-js~="js-scoreboard-score"]')[0],
    };

    let _scoreTimer = 0;
    let _score = 0;

    function init(duration = _defaults.duration, scoreElem = _defaults.scoreElem) {
      _defaults.duration = duration;
      _defaults.scoreElem = scoreElem;
    }

    function incrementScore(value = 1) {
      _score += value;

      _defaults.scoreElem.innerHTML = _score;
    }

    function start(callback) {
      let startTime = new Date().getTime();
      _score = 0;

      _scoreTimer = setInterval(() => {
        let endTime = startTime + _defaults.duration;
        let elapsedTime = endTime - new Date().getTime();

        if (!(elapsedTime > 0)) {
          stop();
          callback();
        }
      }, 50);
    }

    function reset() {
      _score = 0;
      _defaults.scoreElem.innerHTML = _score;
    }

    function stop() {
      if (_scoreTimer) {
        window.clearInterval(_scoreTimer);
      }
    }

    /*
     * Public API
     */
    return {
      incrementScore,
      init,
      reset,
      start,
      stop,
    };
  })();

  const Moles = (function () {
    const _defaults = {
      moleCount: 9,
      concurrency: 4,
      duration: 1000,
    };

    const _DOMCache = {
      moles: document.querySelectorAll('[data-js~="js-mole"]'),
    };

    let _moles = [];
    let _moleTimer = 0;

    function destroy() {
      let moles = document.querySelectorAll('[data-js~="js-mole"]');
      _moles = [];

      moles.forEach(mole => {
        mole.classList.remove('visible');
      });
    }

    function generate() {
      while (_moles.length < _defaults.concurrency) {
        let random = Math.floor((Math.random() * _defaults.moleCount) + 1);
        let mole = _DOMCache.moles[random - 1];

        if (!~_moles.indexOf(mole)) {
          _moles.push(_DOMCache.moles[random - 1]);
        }
      }

      _moles.forEach(function (mole) {
        mole.classList.add('visible');
      });
    }

    function init(moleCount = _defaults.moleCount) {
      _defaults.moleCount = moleCount;
    }

    function reset() {
      _moles.forEach(function (mole) {
        mole.classList.remove('visible');
      });
    }

    function start() {
      reset();

      _moleTimer = setInterval(() => {
        destroy();
        generate();
      }, _defaults.duration);
    }

    function stop() {
      if (_moleTimer) {
        window.clearInterval(_moleTimer);
      }
    }

    /*
     * Public API
     */
    return {
      init,
      reset,
      start,
      stop,
    };
  })();

  (function (scoreboard, moles) {
    const _defaults = {
      duration: 10000,
      moleCount: 9,
    };

    const _DOMCache = {
      startGame: document.querySelectorAll('[data-js~="js-start"]')[0],
      gameboard: document.querySelectorAll('[data-js~="js-gameboard"]')[0],
      score: document.querySelectorAll('[data-js~="js-scoreboard-score"]')[0],
      gameover: document.querySelectorAll('[data-js~="js-gameover"]')[0],
    };

    scoreboard.init(
      _defaults.duration,
      _DOMCache.score,
    );

    moles.init(_defaults.moleCount);

    const _state = {
      running: false,
    };

    function _init() {
      _initUserEvents();
    }

    function _initUserEvents() {
      if (_DOMCache.startGame) {
        _DOMCache.startGame.addEventListener('click', _startGameHandler);
      }

      if (_DOMCache.gameboard) {
        _DOMCache.gameboard.addEventListener('click', _whacMoleHandler);
      }
    }

    function _resetState() {
      _state.running = false;
    }

    function start() {
      if (!_state.running) {
        _DOMCache.gameover.classList.remove('visible');
        _state.running = true;
        scoreboard.reset();
        moles.start();
        scoreboard.start(function () {
          stop();
        });
      }
    }

    function _startGameHandler() {
      start();
    }

    function stop() {
      moles.stop();
      _resetState();
      _DOMCache.gameover.classList.add('visible');
    }

    function _whacMoleHandler(e) {
      let target = e.target.getAttribute('data-js');

      if (target && ~target.indexOf('js-mole')) {
        _whacMole(e.target);
      }
    }

    function _whacMole(mole) {
      if (_state.running) {
        scoreboard.incrementScore();
        mole.classList.remove('visible');
      }
    }

    _init();
  })(Scoreboard, Moles);
})(window, document);
