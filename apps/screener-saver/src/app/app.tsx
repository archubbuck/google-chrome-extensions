import { useState, useEffect } from 'react';
import styles from './app.module.css';

interface ScreenerQuestion {
  id: string;
  questionText: string;
  answer: string;
  timestamp: number;
  url: string;
}

// Helper function to filter questions
function filterQuestions(questions: ScreenerQuestion[], searchTerm: string): ScreenerQuestion[] {
  if (!searchTerm.trim()) {
    return questions;
  }

  const term = searchTerm.toLowerCase();
  return questions.filter(
    (q) =>
      q.questionText.toLowerCase().includes(term) ||
      q.answer.toLowerCase().includes(term)
  );
}

export function App() {
  const [questions, setQuestions] = useState<ScreenerQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<ScreenerQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Load questions from chrome.storage.local
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const result = await chrome.storage.local.get(['savedQuestions']);
        const savedQuestions: ScreenerQuestion[] = (result.savedQuestions as ScreenerQuestion[]) || [];
        // Sort by timestamp descending (newest first)
        savedQuestions.sort((a, b) => b.timestamp - a.timestamp);
        setQuestions(savedQuestions);
        setFilteredQuestions(savedQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Filter questions based on search term
  useEffect(() => {
    const filtered = filterQuestions(questions, searchTerm);
    setFilteredQuestions(filtered);
  }, [searchTerm, questions]);

  // Clear all saved questions
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all saved questions?')) {
      try {
        await chrome.storage.local.set({ savedQuestions: [] });
        setQuestions([]);
        setFilteredQuestions([]);
      } catch (error) {
        console.error('Error clearing questions:', error);
      }
    }
  };

  // Delete a single question
  const handleDeleteQuestion = async (id: string) => {
    try {
      const updated = questions.filter((q) => q.id !== id);
      await chrome.storage.local.set({ savedQuestions: updated });
      setQuestions(updated);
      setFilteredQuestions(filterQuestions(updated, searchTerm));
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  // Format timestamp
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading saved questions...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Screener Saver</h1>
        <p>Browse and search your saved UserTesting.com screener questions</p>
      </header>

      <div className={styles.searchSection}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search questions or answers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {questions.length > 0 && (
          <button className={styles.clearButton} onClick={handleClearAll}>
            Clear All
          </button>
        )}
      </div>

      <div className={styles.stats}>
        {filteredQuestions.length !== questions.length && (
          <p>
            Showing {filteredQuestions.length} of {questions.length} questions
          </p>
        )}
        {filteredQuestions.length === questions.length && (
          <p>{questions.length} saved question{questions.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {filteredQuestions.length === 0 && !searchTerm && (
        <div className={styles.empty}>
          <p>No saved questions yet.</p>
          <p>Visit UserTesting.com and complete a screener to save questions.</p>
        </div>
      )}

      {filteredQuestions.length === 0 && searchTerm && (
        <div className={styles.empty}>
          <p>No questions match your search.</p>
        </div>
      )}

      <div className={styles.questionsList}>
        {filteredQuestions.map((question) => (
          <div key={question.id} className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <h3>{question.questionText}</h3>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteQuestion(question.id)}
                title="Delete question"
              >
                ×
              </button>
            </div>
            <div className={styles.answer}>
              <strong>Answer:</strong> {question.answer}
            </div>
            <div className={styles.metadata}>
              <span className={styles.timestamp}>{formatDate(question.timestamp)}</span>
              <a
                href={question.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                View page
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
