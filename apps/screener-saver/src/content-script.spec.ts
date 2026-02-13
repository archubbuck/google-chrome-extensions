import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Content Script - Answer Extraction', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <!-- Test case 1: tk-card-select with nested label -->
          <div class="tk-card-select" id="test1">
            <div class="tk-card-select__title">
              <h2>What is your employment status?</h2>
            </div>
            <label class="tk-card-select__option tk-card-select__option--selected">
              <input type="radio" name="employment" value="self-employed" checked>
              <div class="tk-card-select__option-label">Self-employed</div>
            </label>
          </div>

          <!-- Test case 2: split-view with checkboxes -->
          <div class="split-view" id="test2">
            <div class="split-view__question">
              <h3>Which platforms do you use?</h3>
            </div>
            <label>
              <input type="checkbox" name="platforms[]" value="facebook" checked>
              <span class="option-text">Facebook</span>
            </label>
            <label>
              <input type="checkbox" name="platforms[]" value="instagram" checked>
              <span class="option-text">Instagram</span>
            </label>
          </div>

          <!-- Test case 3: Radio without nested elements -->
          <div class="tk-card-select" id="test3">
            <h2>Simple question?</h2>
            <label>
              <input type="radio" name="simple" value="yes" checked>
              <span>Yes</span>
            </label>
          </div>
        </body>
      </html>
    `;
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  // Helper function to extract question text
  function extractQuestionText(element: Element): string | null {
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

    const headings = element.querySelectorAll('h1, h2, h3, h4');
    if (headings.length > 0) {
      return headings[0].textContent?.trim() || null;
    }

    return null;
  }

  // Helper function to extract selected answer
  function extractSelectedAnswer(element: Element): string | null {
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
        let targetElement: Element | null = null;
        
        // If the matched element is a label or has a label role, use it directly
        if (option.tagName === 'LABEL' || option.getAttribute('role') === 'option') {
          targetElement = option;
        } else {
          // Otherwise, try to find the associated label
          targetElement = option.closest('label') || 
                         element.querySelector(`label[for="${(option as HTMLInputElement).id}"]`) ||
                         option.parentElement;
        }
        
        if (targetElement) {
          // Try to find specific answer text elements within the target
          const answerTextSelectors = [
            '.tk-card-select__option-label',
            '.option-text',
            'span',
            '.label-text',
            '[data-test*="option-text"]'
          ];
          
          let text = '';
          for (const textSelector of answerTextSelectors) {
            const textElement = targetElement.querySelector(textSelector);
            if (textElement?.textContent?.trim()) {
              text = textElement.textContent.trim();
              break;
            }
          }
          
          // Fallback to full text if no specific text element found
          if (!text && targetElement.textContent) {
            text = targetElement.textContent.trim();
          }
          
          if (text && !selectedElements.includes(text)) {
            selectedElements.push(text);
          }
        }
      });
    }

    return selectedElements.length > 0 ? selectedElements.join(', ') : null;
  }

  it('should extract question text from tk-card-select', () => {
    const element = document.getElementById('test1')!;
    const questionText = extractQuestionText(element);
    expect(questionText).toBe('What is your employment status?');
  });

  it('should extract answer from tk-card-select with nested option-label', () => {
    const element = document.getElementById('test1')!;
    const answer = extractSelectedAnswer(element);
    expect(answer).toBe('Self-employed');
  });

  it('should extract question text from split-view', () => {
    const element = document.getElementById('test2')!;
    const questionText = extractQuestionText(element);
    expect(questionText).toBe('Which platforms do you use?');
  });

  it('should extract multiple answers from checkboxes', () => {
    const element = document.getElementById('test2')!;
    const answer = extractSelectedAnswer(element);
    expect(answer).toBe('Facebook, Instagram');
  });

  it('should extract answer from simple radio with span', () => {
    const element = document.getElementById('test3')!;
    const answer = extractSelectedAnswer(element);
    expect(answer).toBe('Yes');
  });

  it('should handle tk-card-select__option--selected class on label', () => {
    const element = document.getElementById('test1')!;
    const answer = extractSelectedAnswer(element);
    // Should find the answer either from checked input or from selected class on label
    expect(answer).toBe('Self-employed');
  });
});
