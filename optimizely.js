(function () {
  'use strict';

  window.__solarOptlyChangesAppliedCount =
    (window.__solarOptlyChangesAppliedCount || 0) + 1;
  console.log(
    '[Solar Optimizely] changes applied #' + window.__solarOptlyChangesAppliedCount
  );

  if (window.__solarOptlyThankYouScriptLoaded) return;
  window.__solarOptlyThankYouScriptLoaded = true;

  var CONFIG = {
    appUrl:
      'https://solar-form-optly-def.vercel.app/loader',
    typPathContains: '/typ/project-solar/appointment/sp-uk/',
    debug: true,
    maxWaitMs: 30000,
    pollMs: 250,
    eligibilityStorageKey: 'solar_optly_eligible_submission',
    eligibilityTtlMs: 30 * 60 * 1000,
    iframeIdPrefix: 'mvfFormWidget-',
    hiddenMainPageRowSelector:
      'div.vc_row.wpb_row.vc_row-fluid.background-position-center-center',
    hiddenMainPageRowIndexes: [0, 2], // Hide/show only 1st and 3rd matches
    heightDebug: true,
    requiredAnswers: {
      // Accept multiple variants because Chameleon configs can emit either label text
      // (e.g. "homeowner") or binary values (e.g. "yes"/"no").
      'a2f8b4ab-f96c-11e4-824b-22000a699fb3': ['homeowner', 'yes'],
      '128a72ad-041e-11ed-a6b2-062f1bcd6de3': ['home'],
      'a6c8cf0f-995a-11e7-bbea-02e4563f24a3': ['no'],
      'b9f10adf-995a-11e7-bbea-02e4563f24a3': ['no'],
    },
  };

  function log() {
    if (!CONFIG.debug) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[Solar Optimizely]');
    try {
      console.log.apply(console, args);
    } catch (e) {
      // no-op
    }
  }

  function heightLog() {
    if (!CONFIG.heightDebug) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[Solar Optimizely Height]');
    try {
      console.log.apply(console, args);
    } catch (e) {
      // no-op
    }
  }

  function normalize(value) {
    return String(value == null ? '' : value).trim().toLowerCase();
  }

  function now() {
    return Date.now();
  }

  function isTypUrl() {
    var href = String(
      window.location && window.location.href ? window.location.href : ''
    );
    return href.indexOf(CONFIG.typPathContains) !== -1;
  }

  function persistEligibilityMarker() {
    var payload = {
      matchedAt: now(),
      prefillPostcode: window.__solarOptlyPrefillPostcode || '',
      prefillFirstName: window.__solarOptlyPrefillFirstName || '',
      prefillAnswers: window.__solarOptlyPrefillAnswers || {},
    };
    try {
      log('Persisting eligibility marker', {
        key: CONFIG.eligibilityStorageKey,
        payload: payload,
      });
      sessionStorage.setItem(
        CONFIG.eligibilityStorageKey,
        JSON.stringify(payload)
      );
    } catch (e) {
      log('Failed to persist eligibility marker', e);
    }
  }

  function consumeEligibilityMarkerIfFresh() {
    try {
      var raw = sessionStorage.getItem(CONFIG.eligibilityStorageKey);
      if (!raw) {
        log('No eligibility marker found in sessionStorage');
        return null;
      }
      var parsed = JSON.parse(raw);
      var isFresh =
        parsed &&
        typeof parsed.matchedAt === 'number' &&
        now() - parsed.matchedAt <= CONFIG.eligibilityTtlMs;
      log('Eligibility marker read', {
        raw: raw,
        isFresh: isFresh,
        ageMs:
          parsed && typeof parsed.matchedAt === 'number'
            ? now() - parsed.matchedAt
            : null,
      });
      sessionStorage.removeItem(CONFIG.eligibilityStorageKey);
      return isFresh ? parsed : null;
    } catch (e) {
      log('Error reading eligibility marker', e);
      try {
        sessionStorage.removeItem(CONFIG.eligibilityStorageKey);
      } catch (ignore) {
        log('Error clearing broken eligibility marker', ignore);
      }
      return null;
    }
  }

  function extractAnswerValue(answers, sugarId) {
    if (!answers || typeof answers !== 'object') return '';

    var directKey = 'answers[' + sugarId + ']';
    if (Object.prototype.hasOwnProperty.call(answers, directKey)) {
      return answers[directKey];
    }
    if (Object.prototype.hasOwnProperty.call(answers, sugarId)) {
      return answers[sugarId];
    }
    return '';
  }

  function isEligible(answers) {
    if (!answers || typeof answers !== 'object') return false;

    var requiredIds = Object.keys(CONFIG.requiredAnswers);
    for (var i = 0; i < requiredIds.length; i += 1) {
      var id = requiredIds[i];
      var expectedListRaw = CONFIG.requiredAnswers[id];
      var expectedList = Array.isArray(expectedListRaw)
        ? expectedListRaw.map(normalize)
        : [normalize(expectedListRaw)];
      var actual = normalize(extractAnswerValue(answers, id));
      log('Evaluating answer', {
        sugarId: id,
        expectedAnyOf: expectedList,
        actual: actual,
      });
      if (expectedList.indexOf(actual) === -1) {
        log(
          'Mismatch for',
          id,
          'expected one of',
          expectedList.join(', '),
          'received',
          actual
        );
        return false;
      }
    }

    return true;
  }

  function getTargetIframe(preferredIFrameId) {
    if (preferredIFrameId) {
      var exact = document.getElementById(preferredIFrameId);
      if (exact && exact.tagName === 'IFRAME') return exact;
    }

    var prefixed = document.querySelector(
      'iframe[id^="' + CONFIG.iframeIdPrefix + '"]'
    );
    return prefixed || null;
  }

  function extractTextFromAnswers(answers, keys) {
    if (!answers || typeof answers !== 'object') return '';
    for (var i = 0; i < keys.length; i += 1) {
      var val = answers[keys[i]] || answers['answers[' + keys[i] + ']'];
      if (val && String(val).trim()) {
        return String(val).trim();
      }
    }
    return '';
  }

  function extractPostcodeFromAnswers(answers) {
    if (!answers || typeof answers !== 'object') return '';
    var keys = [
      'primary_address_postalcode',
      'primary_address_postcode',
      'postcode',
      'answers[primary_address_postalcode]',
    ];
    for (var i = 0; i < keys.length; i += 1) {
      var val = answers[keys[i]] || answers['answers[' + keys[i] + ']'];
      if (val && String(val).trim()) {
        return String(val).trim().replace(/\s/g, '').toUpperCase();
      }
    }
    // Fallback: scan for any key containing postcode/postal
    for (var k in answers) {
      if (
        Object.prototype.hasOwnProperty.call(answers, k) &&
        /postcode|postal/i.test(k) &&
        answers[k] &&
        String(answers[k]).trim()
      ) {
        return String(answers[k]).trim().replace(/\s/g, '').toUpperCase();
      }
    }
    return '';
  }

  function buildAppUrl() {
    var separator = CONFIG.appUrl.indexOf('?') === -1 ? '?' : '&';
    var url = CONFIG.appUrl + separator + 'optly_iframe=1&ts=' + now();
    var pc = window.__solarOptlyPrefillPostcode;
    var fn = window.__solarOptlyPrefillFirstName;
    if (pc) {
      url += '&prefill_postcode=' + encodeURIComponent(pc);
      log('buildAppUrl: including prefill_postcode', pc);
    }
    if (fn) {
      url += '&prefill_first_name=' + encodeURIComponent(fn);
      log('buildAppUrl: including prefill_first_name', fn);
    }
    return url;
  }

  function isAppUrl(url) {
    return normalize(url).indexOf(normalize(CONFIG.appUrl)) === 0;
  }

  function hideIframeDuringSwap(preferredIFrameId) {
    var targetIframe = getTargetIframe(preferredIFrameId);
    if (!targetIframe) return false;

    targetIframe.style.visibility = 'hidden';
    targetIframe.style.opacity = '0';
    targetIframe.style.transition = 'none';
    targetIframe.setAttribute('data-solar-optly-swapping', '1');
    return true;
  }

  function revealIframeAfterSwap(preferredIFrameId) {
    var targetIframe = getTargetIframe(preferredIFrameId);
    if (!targetIframe) return false;

    targetIframe.style.transition = 'opacity 400ms ease';
    targetIframe.style.visibility = 'visible';
    targetIframe.style.opacity = '1';
    targetIframe.removeAttribute('data-solar-optly-swapping');
    hideSwapOverlay(preferredIFrameId);
    return true;
  }

  function ensureSwapOverlay(preferredIFrameId) {
    var targetIframe = getTargetIframe(preferredIFrameId);
    if (!targetIframe) return null;

    var wrapper = targetIframe.closest('.chameleon-widget-wrapper');
    if (!wrapper) return null;

    var parent = wrapper.parentElement || wrapper;
    if (parent.style.position === '') {
      parent.style.position = 'relative';
    }

    var overlay = parent.querySelector('[data-solar-optly-overlay="1"]');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.setAttribute('data-solar-optly-overlay', '1');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.left = '0';
    overlay.style.background = '#ffffff';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.transition = 'opacity 400ms ease';
    parent.appendChild(overlay);
    return overlay;
  }

  function showSwapOverlay(preferredIFrameId) {
    var overlay = ensureSwapOverlay(preferredIFrameId);
    if (!overlay) return false;
    overlay.style.transition = 'none';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'auto';
    return true;
  }

  function hideSwapOverlay(preferredIFrameId) {
    var targetIframe = getTargetIframe(preferredIFrameId);
    if (!targetIframe) return false;
    var wrapper = targetIframe.closest('.chameleon-widget-wrapper');
    if (!wrapper) return false;
    var parent = wrapper.parentElement || wrapper;
    var overlay = parent.querySelector('[data-solar-optly-overlay="1"]');
    if (!overlay) return false;
    overlay.style.transition = 'opacity 400ms ease';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    return true;
  }

  function attachIframeHeightSync(preferredIFrameId) {
    var targetIframe = getTargetIframe(preferredIFrameId);
    if (!targetIframe) return false;

    var clearWrapperHeightConstraints = function () {
      var activeIframe = getTargetIframe(preferredIFrameId);
      if (!activeIframe) return;
      activeIframe.style.removeProperty('min-height');

      var wrapper = activeIframe.closest('.chameleon-widget-wrapper');
      if (!wrapper) return;
      wrapper.style.removeProperty('height');
      wrapper.style.removeProperty('min-height');

      var wrapperCard = wrapper.firstElementChild;
      if (!wrapperCard || wrapperCard.nodeType !== 1) return;

      wrapperCard.style.removeProperty('height');
      wrapperCard.style.removeProperty('min-height');
      heightLog('cleared wrapper height constraints', {
        iframeId: activeIframe.id,
      });
    };

    var applyIframeHeight = function (nextHeight) {
      var activeIframe = getTargetIframe(preferredIFrameId);
      if (!activeIframe) return;

      var normalizedHeight = Math.max(200, Math.ceil(Number(nextHeight) || 0));
      if (!normalizedHeight) return;
      if (window.__solarOptlyLastIframeHeight === normalizedHeight) return;
      window.__solarOptlyLastIframeHeight = normalizedHeight;

      activeIframe.style.removeProperty('min-height');
      activeIframe.style.height = normalizedHeight + 'px';
      clearWrapperHeightConstraints();

      // Keep iframe visible/centered when height changes (e.g. step transitions)
      try {
        activeIframe.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {
        activeIframe.scrollIntoView({ block: 'center' });
      }

      heightLog('applied dynamic iframe height', {
        iframeId: activeIframe.id,
        height: normalizedHeight,
        iframeInlineHeight: activeIframe.style.height,
      });
    };

    var requestHeightFromChild = function () {
      var activeIframe = getTargetIframe(preferredIFrameId);
      if (!activeIframe || !activeIframe.contentWindow) return;
      activeIframe.contentWindow.postMessage(
        {
          type: 'solar-optly-height-request',
        },
        '*'
      );
      heightLog('requested height from child', {
        iframeId: activeIframe.id,
      });
    };

    if (!targetIframe.__solarOptlyHeightBaseStylesApplied) {
      targetIframe.style.width = '100%';
      targetIframe.style.maxWidth = '100%';
      targetIframe.style.display = 'block';
      targetIframe.style.border = '0';
      targetIframe.setAttribute('scrolling', 'no');
      targetIframe.__solarOptlyHeightBaseStylesApplied = true;
    }
    clearWrapperHeightConstraints();

    if (!targetIframe.__solarOptlyHeightSyncOnLoadAttached) {
      targetIframe.addEventListener('load', function () {
        clearWrapperHeightConstraints();
        requestHeightFromChild();
      });
      targetIframe.__solarOptlyHeightSyncOnLoadAttached = true;
    }

    if (!window.__solarOptlyHeightMessageHandlerAttached) {
      window.addEventListener('message', function (event) {
        var activeIframe = getTargetIframe(preferredIFrameId);
        if (!activeIframe || event.source !== activeIframe.contentWindow) return;

        var payload = event.data;
        if (!payload) return;

        if (payload.type === 'solar-optly-loader-complete') {
          window.__solarOptlyIframeReadyForReveal = true;
          syncMainPageRowVisibility();
          revealIframeAfterSwap(preferredIFrameId);
          heightLog('received loader-complete event; showing main rows', {
            iframeId: activeIframe.id,
          });
          return;
        }

        if (payload.type === 'solar-optly-prefill-request') {
          var prefillAnswers = window.__solarOptlyPrefillAnswers || {};
          if (Object.keys(prefillAnswers).length > 0 && activeIframe.contentWindow) {
            activeIframe.contentWindow.postMessage(
              { type: 'solar-optly-prefill', answers: prefillAnswers },
              '*'
            );
            log('Sent prefill answers to iframe', prefillAnswers);
          }
          return;
        }

        if (payload.type !== 'solar-optly-height') return;
        heightLog('received height payload', {
          iframeId: activeIframe.id,
          payloadHeight: payload.height,
          path: payload.path,
        });
        applyIframeHeight(payload.height);
        if (payload.path && payload.path !== '/loader') {
          window.__solarOptlyIframeReadyForReveal = true;
          syncMainPageRowVisibility();
        }
        revealIframeAfterSwap(preferredIFrameId);
      });
      window.__solarOptlyHeightMessageHandlerAttached = true;
    }

    requestHeightFromChild();
    window.setTimeout(requestHeightFromChild, 250);
    window.setTimeout(requestHeightFromChild, 900);
    log('Iframe height sync active');
    return true;
  }

  function setMainPageRowVisibility(shouldShow) {
    var nodes = document.querySelectorAll(CONFIG.hiddenMainPageRowSelector);
    if (!nodes || nodes.length === 0) {
      log('No target row found to toggle visibility');
      return;
    }

    var targetIndexes = CONFIG.hiddenMainPageRowIndexes || [];
    var affected = 0;

    for (var i = 0; i < targetIndexes.length; i += 1) {
      var index = targetIndexes[i];
      var node = nodes[index];
      if (!node) continue;

      if (shouldShow) {
        node.style.removeProperty('display');
        node.removeAttribute('data-solar-optly-hidden');
      } else {
        node.style.setProperty('display', 'none', 'important');
        node.setAttribute('data-solar-optly-hidden', '1');
      }
      affected += 1;
    }

    log('Updated main page rows visibility', {
      selector: CONFIG.hiddenMainPageRowSelector,
      targetIndexes: targetIndexes,
      shouldShow: shouldShow,
      matchedCount: nodes.length,
      affectedCount: affected,
    });
  }

  function syncMainPageRowVisibility() {
    setMainPageRowVisibility(!!window.__solarOptlyIframeReadyForReveal);
  }

  function watchMainPageRowVisibility() {
    if (window.__solarOptlyMainPageRowObserver) return;

    try {
      var observer = new MutationObserver(function () {
        syncMainPageRowVisibility();
      });
      observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true,
      });
      window.__solarOptlyMainPageRowObserver = observer;
      log('Main page row visibility observer attached');
    } catch (e) {
      log('Failed to attach main page row observer', e);
    }
  }

  function lockIframeToApp(preferredIFrameId) {
    if (window.__solarOptlyIframeLockActive) return;

    var targetIframe = getTargetIframe(preferredIFrameId);
    if (!targetIframe) return;

    window.__solarOptlyIframeLockActive = true;
    log('Activating iframe lock', targetIframe.id);

    var enforce = function () {
      if (!window.__solarOptlyQualified) return;
      var current = targetIframe.getAttribute('src') || '';
      if (!isAppUrl(current)) {
        var forced = buildAppUrl();
        targetIframe.src = forced;
        targetIframe.setAttribute('data-solar-optly', 'mounted');
        log('Iframe lock enforced app src', {
          iframeId: targetIframe.id,
          from: current,
          to: forced,
        });
      }
    };

    // React to direct src mutations.
    try {
      var observer = new MutationObserver(function () {
        enforce();
      });
      observer.observe(targetIframe, {
        attributes: true,
        attributeFilter: ['src'],
      });
      window.__solarOptlyIframeObserver = observer;
    } catch (e) {
      log('Unable to observe iframe src mutations', e);
    }

    // Also enforce around load transitions and periodic checks.
    targetIframe.addEventListener('load', enforce);
    var lockInterval = window.setInterval(function () {
      if (!window.__solarOptlyQualified) return;
      enforce();
    }, 500);
    window.__solarOptlyIframeLockInterval = lockInterval;

    enforce();
  }

  function swapIframeSrc(preferredIFrameId) {
    if (window.__solarOptlyIframeInjected) return true;

    var targetIframe = getTargetIframe(preferredIFrameId);
    if (!targetIframe) return false;

    var nextSrc = buildAppUrl();

    hideIframeDuringSwap(preferredIFrameId || targetIframe.id);
    targetIframe.src = nextSrc;
    targetIframe.setAttribute('data-solar-optly', 'mounted');
    window.__solarOptlyIframeInjected = true;
    window.__solarOptlyIframeReadyForReveal = false;

    if (!targetIframe.__solarOptlyRevealOnAppLoadAttached) {
      targetIframe.addEventListener('load', function () {
        var current = targetIframe.getAttribute('src') || '';
        if (!isAppUrl(current)) return;
        revealIframeAfterSwap(preferredIFrameId || targetIframe.id);
      });
      targetIframe.__solarOptlyRevealOnAppLoadAttached = true;
    }

    // Fallback reveal guard in case load/messaging events are delayed.
    window.setTimeout(function () {
      revealIframeAfterSwap(preferredIFrameId || targetIframe.id);
    }, 2500);

    attachIframeHeightSync(preferredIFrameId || targetIframe.id);
    syncMainPageRowVisibility();
    log('Injected app into iframe', {
      iframeId: targetIframe.id,
      src: nextSrc,
    });
    lockIframeToApp(preferredIFrameId || targetIframe.id);
    return true;
  }

  function swapIframeWhenReady(preferredIFrameId) {
    var started = Date.now();
    var timer = window.setInterval(function () {
      hideIframeDuringSwap(preferredIFrameId);
      if (swapIframeSrc(preferredIFrameId)) {
        window.clearInterval(timer);
        return;
      }
      if (Date.now() - started > CONFIG.maxWaitMs) {
        window.clearInterval(timer);
        log('Timed out waiting for iframe with id prefix', CONFIG.iframeIdPrefix);
      }
    }, CONFIG.pollMs);
  }

  function buildPrefillAnswers(answers, eventObj) {
    if (!answers || typeof answers !== 'object') return {};
    var postcode = extractPostcodeFromAnswers(answers);
    return {
      first_name: extractTextFromAnswers(answers, ['first_name']) || '',
      primary_address_postalcode: postcode || '',
      submissionId: (eventObj && (eventObj.submissionId || eventObj.submission_id)) || '',
    };
  }

  function onQualifiedMatch(context, eventObj) {
    if (window.__solarOptlyQualified) return;
    var answers = (eventObj && eventObj.answers) || {};
    var postcode = extractPostcodeFromAnswers(answers);
    var firstName = extractTextFromAnswers(answers, ['first_name']);
    if (postcode) {
      window.__solarOptlyPrefillPostcode = postcode;
      log('Captured postcode prefill from answers', postcode);
    }
    if (firstName) {
      window.__solarOptlyPrefillFirstName = firstName;
      log('Captured first_name prefill from answers', firstName);
    }
    window.__solarOptlyPrefillAnswers = buildPrefillAnswers(answers, eventObj);
    log('Stored prefill answers for postMessage', window.__solarOptlyPrefillAnswers);
    window.__solarOptlyQualified = true;
    window.__solarOptlyIframeReadyForReveal = false;
    persistEligibilityMarker();
    log('Eligibility matched via', context);
    var preferredIFrameId = (eventObj && eventObj.iFrameId) || null;
    if (preferredIFrameId) {
      showSwapOverlay(preferredIFrameId);
      hideIframeDuringSwap(preferredIFrameId);
      log('Qualified before TYP; marker persisted for iframe', preferredIFrameId);
    }
    // Swap even without iFrameId (e.g. webform_submission_completed often lacks it).
    // getTargetIframe(null) falls back to first iframe with prefix.
    swapIframeWhenReady(preferredIFrameId);
    lockIframeToApp(preferredIFrameId);
  }

  function processDataLayerEvent(eventObj) {
    if (!eventObj || typeof eventObj !== 'object') return;
    log('dataLayer event seen', eventObj.event || '(no event name)', eventObj);

    if (eventObj.event === 'pageChanged') {
      var question = normalize(eventObj.currentQuestion || '');
      window.__solarOptlySubmitStageArmed = question === 'phone number';
    }

    if (
      (eventObj.event === 'thankYouPageRequested' || eventObj.event === 'formSubmit') &&
      window.__solarOptlySubmitStageArmed
    ) {
      showSwapOverlay(eventObj.iFrameId);
    }

    if (eventObj.event === 'thankYouPageRequested' && window.__solarOptlyQualified) {
      hideIframeDuringSwap(eventObj.iFrameId);
    }

    if (eventObj.event === 'webform_submission_completed') {
      var answers = eventObj.answers || {};
      log('Processing webform_submission_completed', {
        answerKeys: Object.keys(answers),
        postcode: extractPostcodeFromAnswers(answers),
        firstName: extractTextFromAnswers(answers, ['first_name']),
      });
      if (isEligible(eventObj.answers || {})) {
        onQualifiedMatch('webform_submission_completed', eventObj);
      } else {
        log('Submission did not match eligibility');
      }
      return;
    }

    // Some stacks may expose answers on thankYouPageReached payloads.
    if (eventObj.event === 'thankYouPageReached') {
      var typrAnswers = eventObj.answers || {};
      log('Processing thankYouPageReached', {
        answerKeys: Object.keys(typrAnswers),
        postcode: extractPostcodeFromAnswers(typrAnswers),
        firstName: extractTextFromAnswers(typrAnswers, ['first_name']),
      });
      if (isEligible(eventObj.answers || {})) {
        onQualifiedMatch('thankYouPageReached', eventObj);
      } else if (window.__solarOptlyQualified) {
        var answers = eventObj.answers || {};
        var pc = extractPostcodeFromAnswers(answers);
        var fn = extractTextFromAnswers(answers, ['first_name']);
        if (pc && !window.__solarOptlyPrefillPostcode) {
          window.__solarOptlyPrefillPostcode = pc;
          log('Captured postcode prefill from thankYouPageReached (already qualified)', pc);
        }
        if (fn && !window.__solarOptlyPrefillFirstName) {
          window.__solarOptlyPrefillFirstName = fn;
          log('Captured first_name prefill from thankYouPageReached (already qualified)', fn);
        }
        log('Already qualified; injecting solar form on thankYouPageReached');
        swapIframeWhenReady(eventObj.iFrameId);
        lockIframeToApp(eventObj.iFrameId);
      } else {
        hideSwapOverlay(eventObj.iFrameId);
        log('thankYouPageReached had no eligible answers and no prior qualification');
      }
    }
  }

  var __processedEventIndexes = {};

  function replayDataLayerEvents() {
    window.dataLayer = window.dataLayer || [];
    for (var i = 0; i < window.dataLayer.length; i += 1) {
      if (__processedEventIndexes[i]) continue;
      __processedEventIndexes[i] = true;
      processDataLayerEvent(window.dataLayer[i]);
    }
  }

  function wrapPush() {
    window.dataLayer = window.dataLayer || [];

    var originalPush = window.dataLayer.push;

    // Skip wrapping if our wrapper is already the current push
    if (originalPush && originalPush.__solarOptlyWrapped) return;

    var wrappedPush = function () {
      var args = Array.prototype.slice.call(arguments);
      for (var j = 0; j < args.length; j += 1) {
        processDataLayerEvent(args[j]);
      }
      return originalPush.apply(window.dataLayer, args);
    };
    wrappedPush.__solarOptlyWrapped = true;
    window.dataLayer.push = wrappedPush;

    log('dataLayer.push wrapped (original was', typeof originalPush, ')');
  }

  function attachDataLayerHook() {
    window.dataLayer = window.dataLayer || [];

    replayDataLayerEvents();
    wrapPush();

    // Safari/GTM resilience: periodically re-scan and re-hook in case
    // GTM replaces our push override or events were pushed before our hook.
    if (!window.__solarOptlyDataLayerPolling) {
      window.__solarOptlyDataLayerPolling = true;
      var pollCount = 0;
      var pollInterval = window.setInterval(function () {
        pollCount += 1;
        // Re-wrap push if something overwrote it
        if (
          !window.dataLayer.push ||
          !window.dataLayer.push.__solarOptlyWrapped
        ) {
          log('dataLayer.push was overwritten; re-wrapping (poll #' + pollCount + ')');
          wrapPush();
        }
        // Re-scan for events we haven't seen yet
        replayDataLayerEvents();
        // Stop polling after qualification or after 2 minutes
        if (window.__solarOptlyQualified || pollCount >= 240) {
          window.clearInterval(pollInterval);
          log('dataLayer polling stopped', {
            qualified: !!window.__solarOptlyQualified,
            pollCount: pollCount,
          });
        }
      }, 500);
    }

    log('dataLayer hook attached');
  }

  // If the script initializes on TYP after full-page reload, inject for eligible users only.
  var freshMarker = isTypUrl() ? consumeEligibilityMarkerIfFresh() : null;
  if (isTypUrl() && freshMarker) {
    if (freshMarker.prefillPostcode) {
      window.__solarOptlyPrefillPostcode = freshMarker.prefillPostcode;
      log('Loaded postcode prefill from marker', freshMarker.prefillPostcode);
    }
    if (freshMarker.prefillFirstName) {
      window.__solarOptlyPrefillFirstName = freshMarker.prefillFirstName;
      log('Loaded first_name prefill from marker', freshMarker.prefillFirstName);
    }
    if (freshMarker.prefillAnswers && Object.keys(freshMarker.prefillAnswers).length > 0) {
      window.__solarOptlyPrefillAnswers = freshMarker.prefillAnswers;
      log('Loaded prefill answers from marker', freshMarker.prefillAnswers);
    }
    window.__solarOptlyQualified = true;
    window.__solarOptlyIframeReadyForReveal = false;
    hideIframeDuringSwap();
    syncMainPageRowVisibility();
    watchMainPageRowVisibility();
    log('Eligible marker found on TYP, attempting iframe injection');
    swapIframeWhenReady();
    lockIframeToApp();
  } else if (isTypUrl()) {
    window.__solarOptlyIframeReadyForReveal = false;
    syncMainPageRowVisibility();
    watchMainPageRowVisibility();
    log('On TYP but no fresh eligibility marker; keeping original TYP');
  } else {
    syncMainPageRowVisibility();
    watchMainPageRowVisibility();
  }

  attachDataLayerHook();
})();
