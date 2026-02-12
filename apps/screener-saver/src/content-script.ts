// Content script to detect and capture screener questions
// Targets tk-card-select and split-view patterns

interface ScreenerQuestion {
  id: string;
  questionText: string;
  answer: string;
  timestamp: number;
  url: string;
}

// Utility function to generate unique ID for questions
function generateQuestionId(questionText: string): string {
  return `q_${Date.now()}_${questionText.substring(0, 20).replace(/\s+/g, '_')}`;
}

// Extract question text from tk-card-select elements
function extractQuestionText(element: Element): string | null {
  // Try different selectors for question text
  const questionSelectors = [
    '.question-text',
    '[data-test="question-text"]',
    'h2',
    'h3',
    '.tk-card-select__title',
    '.split-view__question'
  ];

  for (const selector of questionSelectors) {
    const questionElement = element.querySelector(selector);
    if (questionElement?.textContent) {
      return questionElement.textContent.trim();
    }
  }

  // Fallback: try to find any heading-like text
  const headings = element.querySelectorAll('h1, h2, h3, h4');
  if (headings.length > 0) {
    return headings[0].textContent?.trim() || null;
  }

  return null;
}

// Extract selected answer from tk-card-select or split-view
function extractSelectedAnswer(element: Element): string | null {
  // Look for selected/checked options
  const selectedSelectors = [
    'input[type="radio"]:checked',
    'input[type="checkbox"]:checked',
    '.selected',
    '[aria-selected="true"]',
    '.tk-card-select__option--selected'
  ];

  const selectedElements: string[] = [];

  for (const selector of selectedSelectors) {
    const options = element.querySelectorAll(selector);
    options.forEach(option => {
      // Try to get label text
      const label = option.closest('label') || 
                   element.querySelector(`label[for="${option.id}"]`) ||
                   option.parentElement;
      
      if (label?.textContent) {
        const text = label.textContent.trim();
        if (text && !selectedElements.includes(text)) {
          selectedElements.push(text);
        }
      }
    });
  }

  return selectedElements.length > 0 ? selectedElements.join(', ') : null;
}

// Detect screener question containers
function detectScreenerQuestions(): Element[] {
  const containers: Element[] = [];
  
  // Look for tk-card-select elements
  const tkCardSelects = document.querySelectorAll('[class*="tk-card-select"]');
  containers.push(...Array.from(tkCardSelects));

  // Look for split-view elements
  const splitViews = document.querySelectorAll('[class*="split-view"]');
  containers.push(...Array.from(splitViews));

  // Look for question containers with common patterns
  const questionContainers = document.querySelectorAll(
    '[data-test*="question"], [class*="question-container"], [class*="screener"]'
  );
  containers.push(...Array.from(questionContainers));

  return containers;
}

// Capture screener data
function captureScreenerData(): ScreenerQuestion[] {
  const questions: ScreenerQuestion[] = [];
  const containers = detectScreenerQuestions();

  containers.forEach(container => {
    const questionText = extractQuestionText(container);
    const answer = extractSelectedAnswer(container);

    if (questionText && answer) {
      const question: ScreenerQuestion = {
        id: generateQuestionId(questionText),
        questionText,
        answer,
        timestamp: Date.now(),
        url: window.location.href
      };
      questions.push(question);
    }
  });

  return questions;
}

// Save questions to chrome.storage.local
async function saveQuestions(questions: ScreenerQuestion[]): Promise<void> {
  if (questions.length === 0) return;

  try {
    // Get existing questions
    const result = await chrome.storage.local.get(['savedQuestions']);
    const savedQuestions: ScreenerQuestion[] = result.savedQuestions || [];

    // Add new questions (avoid duplicates based on question text and answer)
    questions.forEach(newQuestion => {
      const isDuplicate = savedQuestions.some(
        existing => 
          existing.questionText === newQuestion.questionText &&
          existing.answer === newQuestion.answer
      );

      if (!isDuplicate) {
        savedQuestions.push(newQuestion);
      }
    });

    // Save back to storage
    await chrome.storage.local.set({ savedQuestions });
    console.log(`[Screener Saver] Saved ${questions.length} questions`);
  } catch (error) {
    console.error('[Screener Saver] Error saving questions:', error);
  }
}

// Detect submission and capture data
function detectAndCaptureOnSubmit(): void {
  // Look for submit buttons
  const submitSelectors = [
    'button[type="submit"]',
    'button[class*="submit"]',
    'button[class*="continue"]',
    'button[class*="next"]',
    '[data-test*="submit"]',
    '[data-test*="continue"]'
  ];

  submitSelectors.forEach(selector => {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        // Small delay to ensure answers are captured
        setTimeout(() => {
          const questions = captureScreenerData();
          if (questions.length > 0) {
            saveQuestions(questions);
          }
        }, 100);
      });
    });
  });
}

// Monitor for dynamic content changes
function observePageChanges(): void {
  const observer = new MutationObserver((mutations) => {
    // Check if new screener questions appeared
    const hasNewQuestions = mutations.some(mutation => {
      return Array.from(mutation.addedNodes).some(node => {
        if (node instanceof Element) {
          return node.matches('[class*="tk-card-select"], [class*="split-view"]') ||
                 node.querySelector('[class*="tk-card-select"], [class*="split-view"]');
        }
        return false;
      });
    });

    if (hasNewQuestions) {
      // Re-attach event listeners to new submit buttons
      detectAndCaptureOnSubmit();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize content script
function init(): void {
  console.log('[Screener Saver] Content script loaded');
  
  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      detectAndCaptureOnSubmit();
      observePageChanges();
    });
  } else {
    detectAndCaptureOnSubmit();
    observePageChanges();
  }
}

// Start the content script
init();
