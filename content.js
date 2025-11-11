// content.js - No API key management needed

let currentTarget = null;
let toolbar = null;
let modal = null;
let targetAI = 'gpt';

// Initialize
(async function init() {
  await loadConfig();
  setupEventListeners();
  observeDOM();
})();

async function loadConfig() {
  // 도메인 기반 자동 선택
  const domain = window.location.hostname;

  if (domain.includes('chatgpt.com') || domain.includes('openai.com')) {
    targetAI = 'gpt';
  } else if (domain.includes('claude.ai')) {
    targetAI = 'claude';
  } else if (domain.includes('gemini.google.com')) {
    targetAI = 'gemini';
  } else if (domain.includes('perplexity.ai')) {
    targetAI = 'perplexity';
  } else {
    targetAI = 'gpt'; // 기본값
  }
}

function setupEventListeners() {
  // Listen for shortcut
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'POLISH_SHORTCUT') {
      handlePolishRequest();
    }
  });

  // Focus events
  document.addEventListener('focusin', (e) => {
    if (isEditableElement(e.target)) {
      currentTarget = e.target;
      showToolbar(e.target);
    }
  });

  // focusout 이벤트 - 개선된 버전
  document.addEventListener('focusout', (e) => {
    setTimeout(() => {
      const activeEl = document.activeElement;

      // 포커스가 입력 가능한 요소나 툴바에 있으면 숨기지 않음
      if (toolbar?.contains(activeEl)) {
        return;
      }

      if (isEditableElement(activeEl)) {
        return;
      }

      // 그 외의 경우 툴바 숨김
      hideToolbar();
    }, 150);
  });
}

function observeDOM() {
  const observer = new MutationObserver(() => {
    if (currentTarget && !document.contains(currentTarget)) {
      currentTarget = null;
      hideToolbar();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function isEditableElement(el) {
  if (!el) return false;
  return el.tagName === 'TEXTAREA' ||
         el.isContentEditable ||
         el.getAttribute('role') === 'textbox';
}

function showToolbar(target) {
  if (!toolbar) {
    createToolbar();
  }

  const rect = target.getBoundingClientRect();
  toolbar.style.display = 'flex';
  toolbar.style.top = `${rect.top + window.scrollY - 60}px`;
  toolbar.style.left = `${rect.left + window.scrollX}px`;

  updateToolbarTarget();
}

function hideToolbar() {
  if (toolbar) {
    toolbar.style.display = 'none';
  }
}

function createToolbar() {
  toolbar = document.createElement('div');
  toolbar.className = 'pp-toolbar';

  // AI 이름 표시 (선택 불가)
  const aiNames = {
    gpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    perplexity: 'Perplexity'
  };

  toolbar.innerHTML = `
    <span class="pp-ai-label">${aiNames[targetAI] || 'AI'}용</span>
    <button class="pp-polish-btn">Rewrite</button>
  `;

  document.body.appendChild(toolbar);

  toolbar.querySelector('.pp-polish-btn').addEventListener('click', () => {
    handlePolishRequest();
  });
}

function updateToolbarTarget() {
  // AI 레이블 업데이트
  const aiNames = {
    gpt: 'ChatGPT',
    claude: 'Claude',
    gemini: 'Gemini',
    perplexity: 'Perplexity'
  };

  const label = toolbar?.querySelector('.pp-ai-label');
  if (label) {
    label.textContent = `${aiNames[targetAI] || 'AI'}용`;
  }
}

async function handlePolishRequest() {
  if (!currentTarget) {
    currentTarget = document.activeElement;
    if (!isEditableElement(currentTarget)) {
      return;
    }
  }

  const { text, hasSelection } = getTextAndSelection(currentTarget);

  if (!text || text.trim().length === 0) {
    return;
  }

  showLoadingModal(text);

  try {
    const polished = await window.improvePrompt(text, targetAI);
    updateModalWithResult(polished, hasSelection);
  } catch (error) {
    console.error('Polish error:', error);
    hideModal();
    alert('프롬프트 개선 실패. 네트워크를 확인하세요.');
  }
}

function getTextAndSelection(element) {
  if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
    const start = element.selectionStart;
    const end = element.selectionEnd;

    if (start !== end) {
      return {
        text: element.value.substring(start, end),
        hasSelection: true,
        start,
        end
      };
    }

    return {
      text: element.value,
      hasSelection: false
    };
  } else if (element.isContentEditable) {
    const sel = window.getSelection();

    if (sel.rangeCount > 0 && !sel.isCollapsed) {
      return {
        text: sel.toString(),
        hasSelection: true,
        selection: sel
      };
    }

    return {
      text: element.innerText || element.textContent,
      hasSelection: false
    };
  }

  return { text: '', hasSelection: false };
}

function showLoadingModal(originalText) {
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'pp-modal';
    document.body.appendChild(modal);
  }

  const targetName = window.TARGET_PROMPTS[targetAI]?.name || targetAI.toUpperCase();

  modal.innerHTML = `
    <div class="pp-modal-content pp-modal-large">
      <div class="pp-modal-header">
        <h3>${targetName}용 프롬프트 개선</h3>
        <button class="pp-close-btn">&times;</button>
      </div>

      <div class="pp-modal-body">
        <div class="pp-section">
          <label class="pp-section-label">원본 프롬프트</label>
          <textarea class="pp-original-textarea" rows="6">${originalText}</textarea>
        </div>

        <div class="pp-repolish-wrapper">
          <button class="pp-repolish-btn">🔄 다시 개선하기</button>
        </div>

        <div class="pp-section">
          <label class="pp-section-label">개선된 프롬프트</label>
          <div class="pp-improved-wrapper">
            <div class="pp-loading-spinner"></div>
            <div class="pp-loading-text">GPT가 프롬프트를 개선하는 중...</div>
          </div>
        </div>
      </div>

      <div class="pp-modal-actions">
        <button class="pp-cancel-btn">원본 유지</button>
        <button class="pp-apply-btn" disabled>적용</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  modal.querySelector('.pp-close-btn').addEventListener('click', hideModal);
  modal.querySelector('.pp-cancel-btn').addEventListener('click', hideModal);
}

function updateModalWithResult(polished, hasSelection) {
  // 로딩 스피너를 textarea로 교체
  const improvedWrapper = modal.querySelector('.pp-improved-wrapper');
  improvedWrapper.innerHTML = `
    <textarea class="pp-improved-textarea" rows="10">${polished}</textarea>
  `;

  // 적용 버튼 활성화
  const applyBtn = modal.querySelector('.pp-apply-btn');
  applyBtn.disabled = false;

  // 적용 버튼 이벤트
  applyBtn.onclick = () => {
    const editedText = modal.querySelector('.pp-improved-textarea').value;
    console.log('[DEBUG] Apply button clicked', {
      editedText: editedText.substring(0, 50),
      hasSelection,
      currentTarget
    });
    applyPolished(editedText, hasSelection);
    hideModal();
  };

  // 다시 개선하기 버튼 이벤트
  const repolishBtn = modal.querySelector('.pp-repolish-btn');
  repolishBtn.onclick = async () => {
    const originalTextarea = modal.querySelector('.pp-original-textarea');
    const newOriginal = originalTextarea.value;

    // 로딩 상태로 변경
    improvedWrapper.innerHTML = `
      <div class="pp-loading-spinner"></div>
      <div class="pp-loading-text">다시 개선하는 중...</div>
    `;
    applyBtn.disabled = true;

    try {
      const newPolished = await window.improvePrompt(newOriginal, targetAI);
      improvedWrapper.innerHTML = `
        <textarea class="pp-improved-textarea" rows="10">${newPolished}</textarea>
      `;
      applyBtn.disabled = false;

      // 적용 버튼 이벤트 재등록
      applyBtn.onclick = () => {
        const editedText = modal.querySelector('.pp-improved-textarea').value;
        console.log('[DEBUG] Apply button clicked (after repolish)', {
          editedText: editedText.substring(0, 50),
          hasSelection,
          currentTarget
        });
        applyPolished(editedText, hasSelection);
        hideModal();
      };
    } catch (error) {
      console.error('Repolish error:', error);
      improvedWrapper.innerHTML = `
        <div class="pp-error-text">개선 실패. 다시 시도해주세요.</div>
      `;
    }
  };

  // 모달 클릭으로 닫기
  modal.onclick = (e) => {
    if (e.target === modal) {
      hideModal();
    }
  };
}

function applyPolished(polished, hasSelection) {
  console.log('[DEBUG] applyPolished called', {
    polished: polished.substring(0, 50),
    hasSelection,
    currentTarget: currentTarget,
    tagName: currentTarget?.tagName,
    isContentEditable: currentTarget?.isContentEditable
  });

  if (!currentTarget) {
    console.log('[DEBUG] currentTarget is null!');
    return;
  }

  if (currentTarget.tagName === 'TEXTAREA' || currentTarget.tagName === 'INPUT') {
    if (hasSelection) {
      const start = currentTarget.selectionStart;
      const end = currentTarget.selectionEnd;
      const before = currentTarget.value.substring(0, start);
      const after = currentTarget.value.substring(end);
      currentTarget.value = before + polished + after;
      currentTarget.selectionStart = start;
      currentTarget.selectionEnd = start + polished.length;
    } else {
      currentTarget.value = polished;
    }

    currentTarget.dispatchEvent(new Event('input', { bubbles: true }));
    currentTarget.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (currentTarget.isContentEditable) {
    console.log('[DEBUG] ContentEditable detected');
    // contenteditable의 경우 줄바꿈 처리
    // ChatGPT는 <p> 태그 사용, 일반적인 경우는 <br> 사용

    const lines = polished.split('\n');
    console.log('[DEBUG] Lines:', lines.length);

    if (hasSelection) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();

        const fragment = document.createDocumentFragment();

        lines.forEach((line, index) => {
          // 각 줄을 텍스트 노드로 추가
          const textNode = document.createTextNode(line);
          fragment.appendChild(textNode);

          // 마지막 줄이 아니면 <br> 추가
          if (index < lines.length - 1) {
            fragment.appendChild(document.createElement('br'));
          }
        });

        range.insertNode(fragment);
      }
    } else {
      // 전체 교체
      console.log('[DEBUG] Full replace mode');
      currentTarget.innerHTML = '';

      lines.forEach((line, index) => {
        const textNode = document.createTextNode(line);
        currentTarget.appendChild(textNode);

        if (index < lines.length - 1) {
          currentTarget.appendChild(document.createElement('br'));
        }
      });
      console.log('[DEBUG] Content applied, innerHTML length:', currentTarget.innerHTML.length);
    }

    // 입력 이벤트 발생 (중요!)
    console.log('[DEBUG] Dispatching events...');
    currentTarget.dispatchEvent(new Event('input', { bubbles: true }));
    currentTarget.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    currentTarget.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    console.log('[DEBUG] Events dispatched');
  }

  console.log('[DEBUG] Focusing currentTarget...');
  currentTarget.focus();
  console.log('[DEBUG] applyPolished completed');
}

function hideModal() {
  if (modal) {
    modal.style.display = 'none';
  }
}
