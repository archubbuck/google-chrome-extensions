import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { extractQuestionText, extractSelectedAnswer } from './content-script';

describe('Content Script - Answer Extraction', () => {
  let dom: JSDOM;
  let testDocument: Document;

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
    testDocument = dom.window.document as unknown as Document;
    
    // Make document globally available for the imported functions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).document = testDocument;
  });

  it('should extract question text from tk-card-select', () => {
    const element = testDocument.getElementById('test1');
    if (!element) throw new Error('Test element not found');
    const questionText = extractQuestionText(element);
    expect(questionText).toBe('What is your employment status?');
  });

  it('should extract answer from tk-card-select with nested option-label', () => {
    const element = testDocument.getElementById('test1');
    if (!element) throw new Error('Test element not found');
    const answer = extractSelectedAnswer(element);
    expect(answer).toBe('Self-employed');
  });

  it('should extract question text from split-view', () => {
    const element = testDocument.getElementById('test2');
    if (!element) throw new Error('Test element not found');
    const questionText = extractQuestionText(element);
    expect(questionText).toBe('Which platforms do you use?');
  });

  it('should extract multiple answers from checkboxes', () => {
    const element = testDocument.getElementById('test2');
    if (!element) throw new Error('Test element not found');
    const answer = extractSelectedAnswer(element);
    expect(answer).toBe('Facebook, Instagram');
  });

  it('should extract answer from simple radio with span', () => {
    const element = testDocument.getElementById('test3');
    if (!element) throw new Error('Test element not found');
    const answer = extractSelectedAnswer(element);
    expect(answer).toBe('Yes');
  });

  it('should handle tk-card-select__option--selected class on label', () => {
    const element = testDocument.getElementById('test1');
    if (!element) throw new Error('Test element not found');
    const answer = extractSelectedAnswer(element);
    // Should find the answer either from checked input or from selected class on label
    expect(answer).toBe('Self-employed');
  });
});
