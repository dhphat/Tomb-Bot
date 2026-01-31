export const GAS_APP_URL = 'https://script.google.com/macros/s/AKfycbxUTN9F06rbxYvZWmny-QKcZxScSiim0futE_SN6A0RbA1nQ4OmCMc4bsuuRFPOm2Q/exec';

export const loadHighScore = async (): Promise<number> => {
    try {
        const response = await fetch(GAS_APP_URL);
        const data = await response.json();
        const score = Number(data.highScore);
        return isNaN(score) ? 0 : score;
    } catch (error) {
        console.error('Failed to load high score:', error);
        const saved = localStorage.getItem('aerobot_highscore');
        return saved ? Number(saved) || 0 : 0;
    }
};

export const saveHighScore = async (score: number): Promise<void> => {
    // 1. Luôn lưu local trước
    localStorage.setItem('aerobot_highscore', score.toString());

    // 2. Gửi qua URL (GET) - Đây là cách ổn định nhất với Google Apps Script
    try {
        await fetch(`${GAS_APP_URL}?score=${score}`, {
            method: 'GET',
            mode: 'no-cors' // Chế độ này giúp gửi dữ liệu mà không bị chặn bởi CORS
        });
    } catch (error) {
        console.error('Failed to save high score to Google Sheets:', error);
    }
};
