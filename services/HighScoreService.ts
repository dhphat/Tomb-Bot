export const GAS_APP_URL = 'https://script.google.com/macros/s/AKfycbxUTN9F06rbxYvZWmny-QKcZxScSiim0futE_SN6A0RbA1nQ4OmCMc4bsuuRFPOm2Q/exec';

export const loadHighScore = async (): Promise<number> => {
    try {
        const response = await fetch(GAS_APP_URL, {
            method: 'GET',
            mode: 'cors',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const score = Number(data.highScore);
        return isNaN(score) ? 0 : score;
    } catch (error) {
        console.error('Failed to load high score from Google Sheets:', error);
        const saved = localStorage.getItem('aerobot_highscore');
        if (saved) {
            const parsed = Number(saved);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    }
};

export const saveHighScore = async (score: number): Promise<void> => {
    // 1. Luôn lưu local trước để đảm bảo không mất dữ liệu
    try {
        localStorage.setItem('aerobot_highscore', score.toString());
    } catch (e) {
        console.error('Failed to save to local storage:', e);
    }

    // 2. Cố gắng gửi lên Google Sheets
    try {
        // Sử dụng mode: 'no-cors' và gửi dưới dạng text để tránh lỗi CORS preflight
        await fetch(GAS_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({ score: score }),
        });
    } catch (error) {
        console.error('Failed to save high score to Google Sheets:', error);
    }
};
