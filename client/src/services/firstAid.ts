import axios from './axios';

export const getLocalFirstAidGuide = async (prompt: string): Promise<string> => {
  try {
    console.log('🩺 Sending first aid request with prompt:', prompt);
    
    // שליחת string ישירות כפי שהשרת מצפה
    const response = await axios.post('/Ask/first-aid', prompt, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ First aid response:', response.data);
    console.log('✅ Response type:', typeof response.data);
    
    // טיפול חכם בתשובה
    let result = response.data;
    
    if (typeof result === 'string') {
      return result;
    } else if (typeof result === 'object' && result !== null) {
      // נחפש שדות נפוצים של תשובות
      if (result.answer) return result.answer;
      if (result.response) return result.response;
      if (result.instructions) {
        if (typeof result.instructions === 'string') return result.instructions;
        if (Array.isArray(result.instructions)) return result.instructions.join('\n');
      }
      if (result.text) return result.text;
      if (result.content) return result.content;
      
      // אם לא מצאנו שדה מתאים, נמיר לJSON מעוצב
      return JSON.stringify(result, null, 2);
    }
    
    return 'לא התקבלה תשובה מהשרת';
  } catch (error) {
    console.error('❌ First aid request failed:', error);
    throw error;
  }
};