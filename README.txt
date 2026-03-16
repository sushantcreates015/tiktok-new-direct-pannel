TikTok LIVE Rewards - full updated package

What's included:
- mobile-sized frontend UI
- transfer flow
- 2 second loading screen after confirm
- local Node/Express backend for TikTok username lookup
- frontend fetches profile image, name, and followers from localhost:3000

How to start again after closing all terminals:

1) Open Terminal and go to the project:
cd "/path/to/tiktok-live-rewards-full"

2) Install backend packages:
npm install

3) Start backend:
node server.js

4) Open a second Terminal in the same folder:
python3 -m http.server 8000

5) Open browser:
http://localhost:8000

Backend test:
http://localhost:3000/api/tiktok/jsj

If a username does not load, TikTok may have blocked the request for that profile.


New in v2:
- loading screen no longer shows black logo background
- payment method transfer icon now uses the provided TikTok logo inside a black circle
- after payment completes, username input clears automatically
- user can do another transfer again immediately


v4:
- removed logo from loading screen, now only circle loading theme
- complete page keeps the exact entered transfer amount shown as the main amount


v7:
- fixed final Transfer Details amount so it stays on the entered amount and does not revert to 0.00
- preserved completed amount in a local variable before clearing the form


v8:
- fixed final details amount bug by stopping form reset from overwriting the completed transfer details fields


v9:
- rebuilt final transfer details rendering to use a dedicated lastCompleted object
- final top amount and estimated receive now come from saved completed transfer data, not live form state
