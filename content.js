// content.js - 빈 입력창일 때 툴바로 템플릿 제공

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
  // Listen for shortcut (Alt+P)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'POLISH_SHORTCUT') {
      // 현재 포커스된 요소가 입력창이면 템플릿 모달 열기
      const activeEl = document.activeElement;
      if (isEditableElement(activeEl)) {
        currentTarget = activeEl;
        openTemplateModal();
      }
    }
  });

  // Focus events
  document.addEventListener('focusin', (e) => {
    if (isEditableElement(e.target)) {
      currentTarget = e.target;
      // 빈 입력창일 때만 툴바 표시
      if (isEmpty(e.target)) {
        showToolbar(e.target);
      } else {
        hideToolbar();
      }
    }
  });

  // Input events - 사용자가 입력하면 툴바 숨김
  document.addEventListener('input', (e) => {
    if (isEditableElement(e.target) && !isEmpty(e.target)) {
      hideToolbar();
    } else if (isEditableElement(e.target) && isEmpty(e.target)) {
      showToolbar(e.target);
    }
  });

  // focusout 이벤트
  document.addEventListener('focusout', (e) => {
    setTimeout(() => {
      const activeEl = document.activeElement;

      // 포커스가 툴바나 모달에 있으면 숨기지 않음
      if (toolbar?.contains(activeEl) || modal?.contains(activeEl)) {
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

function isEmpty(element) {
  if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
    return !element.value || element.value.trim().length === 0;
  } else if (element.isContentEditable) {
    const text = element.innerText || element.textContent || '';
    return text.trim().length === 0;
  }
  return true;
}

function showToolbar(target) {
  if (!toolbar) {
    createToolbar();
  }

  const rect = target.getBoundingClientRect();
  toolbar.style.display = 'flex';
  toolbar.style.top = `${rect.top + window.scrollY - 60}px`;
  toolbar.style.left = `${rect.left + window.scrollX}px`;
}

function hideToolbar() {
  if (toolbar) {
    toolbar.style.display = 'none';
  }
}

function createToolbar() {
  toolbar = document.createElement('div');
  toolbar.className = 'pp-toolbar';

  toolbar.innerHTML = `
    <button class="pp-template-btn">📝 템플릿 이용하기</button>
  `;

  document.body.appendChild(toolbar);

  toolbar.querySelector('.pp-template-btn').addEventListener('click', () => {
    openTemplateModal();
  });
}

async function openTemplateModal() {
  // 템플릿 가져오기
  const template = await window.improvePrompt('', targetAI);

  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'pp-modal';
    document.body.appendChild(modal);
  }

  const targetName = window.TARGET_PROMPTS[targetAI]?.name || targetAI.toUpperCase();

  modal.innerHTML = `
    <div class="pp-modal-content pp-modal-large">
      <div class="pp-modal-header">
        <h3>${targetName}용 프롬프트 템플릿</h3>
        <button class="pp-close-btn">&times;</button>
      </div>

      <div class="pp-modal-body">
        <div class="pp-section">
          <label class="pp-section-label">템플릿을 수정하세요. 필요없는 부분은 삭제할 수 있습니다.</label>
          <textarea class="pp-template-textarea" rows="20">${template}</textarea>
        </div>
      </div>

      <div class="pp-modal-actions">
        <button class="pp-cancel-btn">취소</button>
        <button class="pp-apply-btn">입력창에 적용</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  // 이벤트 리스너
  modal.querySelector('.pp-close-btn').addEventListener('click', hideModal);
  modal.querySelector('.pp-cancel-btn').addEventListener('click', hideModal);
  modal.querySelector('.pp-apply-btn').addEventListener('click', () => {
    const editedTemplate = modal.querySelector('.pp-template-textarea').value;
    applyTemplate(editedTemplate);
    hideModal();
  });

  // 모달 배경 클릭으로 닫기
  modal.onclick = (e) => {
    if (e.target === modal) {
      hideModal();
    }
  };
}

function applyTemplate(template) {
  if (!currentTarget) {
    console.log('[PromptPolish] No target element');
    return;
  }

  // 요소에 템플릿 삽입
  if (currentTarget.tagName === 'TEXTAREA' || currentTarget.tagName === 'INPUT') {
    currentTarget.value = template;
    currentTarget.dispatchEvent(new Event('input', { bubbles: true }));
    currentTarget.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (currentTarget.isContentEditable) {
    // contenteditable의 경우 줄바꿈 처리
    // ChatGPT 등은 <p> 태그 필요
    const lines = template.split('\n');
    currentTarget.innerHTML = '';

    lines.forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line || '\u00A0'; // 빈 줄은 공백 문자로
      currentTarget.appendChild(p);
    });

    // 입력 이벤트 발생
    currentTarget.dispatchEvent(new Event('input', { bubbles: true }));
    currentTarget.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    currentTarget.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  }

  currentTarget.focus();
  console.log('[PromptPolish] Template applied for', targetAI);
}

function hideModal() {
  if (modal) {
    modal.style.display = 'none';
  }
}
