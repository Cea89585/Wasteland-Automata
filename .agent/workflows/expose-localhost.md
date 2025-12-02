---
description: Expose localhost:9002 to the public internet using localtunnel
---

To make your local server accessible from other devices, we can use `localtunnel`.

1. Ensure your development server is running on port 9002.
2. Run the following command to create a tunnel:

// turbo
```bash
npx localtunnel --port 9002
```

3. The command will output a URL (e.g., `https://funny-cat-12.loca.lt`).
4. Open this URL on your mobile device.
5. **Important**: You might see a "Click to Continue" page. You may need to enter the tunnel password.
   - To get the password, visit `https://loca.lt/mytunnelpassword` on the *same machine* where you ran the command (this computer).
   - Copy the IP address shown there and paste it into the password field on your mobile device.
