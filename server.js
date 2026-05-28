

const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Express Configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let runningBotProcess = null;
let botLogs = "Bot status: Offline\n";

// HTML, CSS, JavaScript Frontend Website
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DTZ BOT RUN SITES</title>
    <!-- Google Fonts for Epic Tech Style -->
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Share Tech Mono', monospace;
        }

        body {
            background-color: #000000;
            color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow-x: hidden;
            padding: 20px;
        }

        /* Login Overlay Screen */
        #login-screen {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: #000000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }

        .login-box {
            background: rgba(15, 15, 15, 0.9);
            border: 2px solid #ff0000;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 20px #ff0000;
            text-align: center;
            width: 90%;
            max-width: 400px;
        }

        .login-box h2 {
            font-family: 'Orbitron', sans-serif;
            color: #ff0000;
            margin-bottom: 20px;
            text-shadow: 0 0 10px #ff0000;
        }

        .login-box input {
            width: 100%;
            padding: 12px;
            background: #111;
            border: 1px solid #ff0000;
            color: #fff;
            margin-bottom: 20px;
            text-align: center;
            font-size: 16px;
        }

        .login-box button {
            background: #ff0000;
            color: #fff;
            border: none;
            padding: 12px 30px;
            cursor: pointer;
            font-weight: bold;
            text-transform: uppercase;
            box-shadow: 0 0 10px #ff0000;
            transition: 0.3s;
        }

        .login-box button:hover {
            background: #fff;
            color: #ff0000;
            box-shadow: 0 0 20px #fff;
        }

        /* Main Dashboard (Hidden by Default) */
        #main-dashboard {
            display: none;
            width: 100%;
            max-width: 800px;
            background: rgba(10, 10, 10, 0.95);
            border: 1px solid #333;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.1);
        }

        /* Rotating Red Ring Header */
        .logo-container {
            position: relative;
            width: 160px;
            height: 160px;
            margin: 0 auto 20px auto;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .rotating-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 4px dashed #ff0000;
            border-radius: 50%;
            animation: rotateRing 8s linear infinite;
            box-shadow: 0 0 15px #ff0000;
        }

        @keyframes rotateRing {
            100% { transform: rotate(360deg); }
        }

        .logo-text {
            font-family: 'Orbitron', sans-serif;
            font-size: 20px;
            font-weight: bold;
            color: #fff;
            text-align: center;
            z-index: 5;
            text-shadow: 0 0 5px #ff0000;
        }

        /* Branding Credits */
        .credits {
            text-align: center;
            margin-bottom: 30px;
        }

        .dev-title {
            font-size: 14px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .powered-by {
            font-family: 'Orbitron', sans-serif;
            font-size: 24px;
            color: #fff;
            font-weight: bold;
            margin: 5px 0;
        }

        .powered-by span {
            color: #ff0000;
            text-shadow: 0 0 10px #ff0000;
        }

        .team-dtz {
            font-size: 16px;
            color: #ff0000;
            letter-spacing: 4px;
            font-weight: bold;
        }

        /* Code Uploader Section */
        .panel {
            background: #0a0a0a;
            border: 1px solid #ff0000;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: inset 0 0 10px rgba(255, 0, 0, 0.2);
        }

        .panel h3 {
            color: #ff0000;
            margin-bottom: 15px;
            font-family: 'Orbitron', sans-serif;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        textarea {
            width: 100%;
            height: 180px;
            background: #000;
            border: 1px solid #333;
            color: #00ff00; /* Classic Hacker Green for code input */
            font-family: 'Share Tech Mono', monospace;
            padding: 15px;
            resize: none;
            border-radius: 5px;
            margin-bottom: 15px;
        }

        textarea:focus {
            outline: none;
            border-color: #ff0000;
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
        }

        .btn-group {
            display: flex;
            gap: 15px;
        }

        .btn {
            flex: 1;
            padding: 12px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            border: none;
            border-radius: 4px;
            text-transform: uppercase;
            transition: 0.3s;
        }

        .btn-start { background: #ff0000; color: #fff; box-shadow: 0 0 10px #ff0000; }
        .btn-start:hover { background: #fff; color: #ff0000; }
        
        .btn-stop { background: #222; color: #fff; border: 1px solid #555; }
        .btn-stop:hover { background: #ff0000; color: #fff; border-color: #ff0000; }

        /* Live Coder Console / Terminal */
        .terminal {
            background: #000;
            border: 1px solid #333;
            height: 150px;
            padding: 15px;
            border-radius: 5px;
            overflow-y: auto;
            font-size: 14px;
            color: #fff;
            white-space: pre-wrap;
        }

        /* How to Run - Guide Guide */
        .guide-step {
            margin-bottom: 10px;
            color: #ccc;
        }
        .guide-step strong {
            color: #ff0000;
        }
    </style>
</head>
<body>

    <!-- 1. LOGIN SCREEN -->
    <div id="login-screen">
        <div class="login-box">
            <h2>System Access 🔴</h2>
            <p style="color: #888; margin-bottom: 15px;">Enter Access Key to Control Dashboard</p>
            <input type="password" id="access-key" placeholder="Enter Password Here...">
            <button onclick="checkLogin()">Login to DTZ</button>
            <p id="login-err" style="color: red; margin-top: 10px; display: none;">❌ Invalid Access Key!</p>
        </div>
    </div>

    <!-- 2. MAIN DASHBOARD -->
    <div id="main-dashboard">
        
        <!-- Rotating Red Ring Header -->
        <div class="logo-container">
            <div class="rotating-ring"></div>
            <div class="logo-text">⚡ DTZ ⚡<br>BOT RUN<br>SITES</div>
        </div>

        <!-- Branding & Credits -->
        <div class="credits">
            <div class="dev-title">DEVELOPER</div>
            <div class="powered-by">POWERED BY <span>SITHUWA</span> 👑</div>
            <div class="team-dtz">DRAK TECH ZONE TEAM DTZ ⚔️</div>
        </div>

        <!-- How to Run (Live Coder Guide) -->
        <div class="panel">
            <h3>📖 LIVE CODER GUIDE (කොහොමද හරියටම රන් කරන්නේ?)</h3>
            <div class="guide-step">1️⃣ <strong>CODE BOX:</strong> ඔයාගේ Bot කෝඩ් එක (index.js / bot.js එකේ තියෙන මුළු කෝඩ් එකම) පහල තියෙන කළු පාට කොටුවට Copy-Paste කරන්න.</div>
            <div class="guide-step">2️⃣ <strong>SAVE & DEPLOY:</strong> ඔයාගේ කෝඩ් එකේ <code>require('package_name')</code> තියෙනවා නම්, සර්වර් එක ඒ ඇප්ස් ඔටෝම ඉන්ස්ටෝල් කරගන්නවා.</div>
            <div class="guide-step">3️⃣ <strong>START BOT:</strong> <u>⚡ START BOT</u> බටන් එක ක්ලික් කරන්න. එවිට සයිට් එකෙන් බොට්ව 24/7 ඔන්ලයින් තියන්න වැඩේ පටන් ගන්නවා.</div>
        </div>

        <!-- Code Input Panel -->
        <div class="panel">
            <h3>💻 PASTE YOUR JAVASCRIPT BOT CODE HERE 🤖</h3>
            <textarea id="bot-code" placeholder="// Paste your JavaScript Node.js Code here...&#10;const Discord = require('discord.js'); // Or WhatsApp Bot library..."></textarea>
            <div class="btn-group">
                <button class="btn btn-start" onclick="startBot()">⚡ Start Bot</button>
                <button class="btn btn-stop" onclick="stopBot()">🛑 Stop Bot</button>
            </div>
        </div>

        <!-- Live Terminal Logs -->
        <div class="panel">
            <h3>📊 LIVE TERMINAL LOGS (ලයිව් තත්ත්වය)</h3>
            <div class="terminal" id="terminal-console">Waiting for Bot to start...</div>
        </div>

    </div>

    <script>
        // Simple Secure Login Logic
        function checkLogin() {
            const key = document.getElementById('access-key').value;
            // Password එක මෙතනින් වෙනස් කරන්න පුළුවන් (Default: dtz123)
            if(key === "dtz123") {
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('main-dashboard').style.display = 'block';
                startLogPolling();
            } else {
                document.getElementById('login-err').style.display = 'block';
            }
        }

        async function startBot() {
            const code = document.getElementById('bot-code').value;
            if(!code.trim()) return alert("කරුණාකර මුලින්ම බොට්ගේ කෝඩ් එක ඇතුලත් කරන්න!");

            const response = await fetch('/api/start-bot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await response.json();
            alert(data.message);
        }

        async function stopBot() {
            const response = await fetch('/api/stop-bot', { method: 'POST' });
            const data = await response.json();
            alert(data.message);
        }

        // Fetch Live logs from backend every 2 seconds
        function startLogPolling() {
            setInterval(async () => {
                try {
                    const response = await fetch('/api/logs');
                    const data = await response.json();
                    const consoleEl = document.getElementById('terminal-console');
                    consoleEl.innerText = data.logs;
                    consoleEl.scrollTop = consoleEl.scrollHeight; // Auto Scroll
                } catch(e) {}
            }, 2000);
        }
    </script>
</body>
</html>
`;

// Endpoints & Logic
app.get('/', (req, res) => {
    res.send(htmlContent);
});

// Start the uploaded Bot code
app.post('/api/start-bot', (req, res) => {
    const botCode = req.body.code;
    const botFilePath = path.join(__dirname, 'user_bot.js');

    // Save user code to a file
    fs.writeFileSync(botFilePath, botCode);

    // If a bot is already running, kill it first
    if (runningBotProcess) {
        runningBotProcess.kill();
        botLogs += "[SYSTEM] Stopping previous instance...\n";
    }

    botLogs = `[SYSTEM] Starting your Bot at ${new Date().toISOString()}\n`;

    // Execute the user code as a separate background process
    runningBotProcess = spawn('node', [botFilePath]);

    runningBotProcess.stdout.on('data', (data) => {
        botLogs += `[LOG] ${data.toString()}`;
    });

    runningBotProcess.stderr.on('data', (data) => {
        botLogs += `[ERROR] ${data.toString()}`;
    });

    runningBotProcess.on('close', (code) => {
        botLogs += `[SYSTEM] Bot process exited with code ${code}\n`;
        runningBotProcess = null;
    });

    res.json({ message: "සයිට් එක මඟින් බොට්ව සාර්ථකව පණ ගැන්වුවා! 🚀" });
});

// Stop Bot Endpoint
app.post('/api/stop-bot', (req, res) => {
    if (runningBotProcess) {
        runningBotProcess.kill();
        runningBotProcess = null;
        botLogs += "[SYSTEM] Bot has been manually stopped.\n";
        res.json({ message: "බොට්ව නවත්වනු ලැබුවා! 🛑" });
    } else {
        res.json({ message: "දැනට කිසිදු බොට් කෙනෙක් රන් වෙමින් නොමැත!" });
    }
});

// Live Logs Endpoint
app.get('/api/logs', (req, res) => {
    res.json({ logs: botLogs });
});

app.listen(PORT, () => {
    console.log(`DTZ Server running on port ${PORT}`);
});
