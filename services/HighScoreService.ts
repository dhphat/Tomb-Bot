export const GAS_APP_URL = 'https://script.google.com/macros/s/AKfycbxUTN9F06rbxYvZWmny-QKcZxScSiim0futE_SN6A0RbA1nQ4OmCMc4bsuuRFPOm2Q/exec';

export const loadHighScore = async (): Promise<number> => {
    try {

        const response = await fetch(GAS_APP_URL);
        const data = await response.json();
        return data.highScore || 0;
    } catch (error) {
        console.error('Failed to load high score from Google Sheets:', error);
        const saved = localStorage.getItem('aerobot_highscore');
        return saved ? parseInt(saved, 10) : 0;
    }
};

export const saveHighScore = async (score: number): Promise<void> => {
    try {
        // Luôn lưu local trước
        localStorage.setItem('aerobot_highscore', score.toString());

        await fetch(GAS_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Sử dụng no-cors để tránh vấn đề CORS với GAS
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score }),
        });
    } catch (error) {
        console.error('Failed to save high score to Google Sheets:', error);
    }
};
