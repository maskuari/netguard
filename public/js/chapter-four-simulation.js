(() => {
    'use strict';
    const parameters = {
        heading: 'Selamat Datang di Hotspot SMK Negeri 1 Amuntai',
        profiles: { kepalasekolah: { shared: 1, rate: '512k/512k', password: '123' }, guru: { shared: 10, rate: '256k/256k', password: '456' }, siswa: { shared: 5, rate: '128k/128k', password: '789' } },
    };
    const ssidValid = (ssid) => typeof ssid === 'string' && ssid.trim().length > 0 && encodeURIComponent(ssid).replace(/%[0-9A-F]{2}/gi, 'x').length <= 32;
    const passwordValid = (password) => typeof password === 'string' && (/^[\x20-\x7e]{8,63}$/.test(password) || /^[0-9a-f]{64}$/i.test(password));
    const dnsNameValid = (name) => typeof name === 'string' && name.length > 0 && name.length <= 253 && name.split('.').every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
    const wirelessValid = (state) => state.wireless.enabled && state.wireless.mode === 'ap bridge' && ssidValid(state.wireless.ssid);
    const securityValid = (state) => Boolean(state.security && state.security.name.trim() && state.security.name !== 'default' && state.security.mode === 'dynamic keys' && state.security.wpa && state.security.wpa2 && passwordValid(state.security.key) && passwordValid(state.security.key2));
    const wifiReady = (state) => wirelessValid(state) && securityValid(state) && state.wireless.security === state.security.name;
    const hotspotValid = (state) => Boolean(state.hotspot && !state.hotspot.disabled && state.hotspot.interface === 'wlan1' && dnsNameValid(state.hotspot.dnsName) && typeof state.hotspot.user === 'string' && state.hotspot.user.trim() && typeof state.hotspot.password === 'string');
    const profileValid = (state, name) => Boolean(parameters.profiles[name] && state.profiles[name] && Number(state.profiles[name].shared) === parameters.profiles[name].shared && state.profiles[name].rate === parameters.profiles[name].rate);
    const userValid = (state, name) => Boolean(profileValid(state, name) && state.users[name] && !state.users[name].disabled && state.users[name].profile === name && state.users[name].password === parameters.profiles[name].password);
    const authenticate = (state, name, password, activeCount = 0) => {
        if (!wifiReady(state) || !state.phoneConnected) return { ok: false, reason: 'wifi' };
        if (!hotspotValid(state)) return { ok: false, reason: 'hotspot' };
        if (!Object.hasOwn(state.users, name) && name === state.hotspot.user && !state.hotspot.userRemoved && !state.hotspot.userDisabled && password === state.hotspot.password) return { ok: true, initial: true, profile: 'default', rate: 'unlimited', shared: 1 };
        if (!userValid(state, name) || state.users[name].password !== password) return { ok: false, reason: 'credentials' };
        const profile = state.profiles[name];
        if (activeCount >= Number(profile.shared)) return { ok: false, reason: 'sessions' };
        return { ok: true, profile: name, rate: profile.rate, shared: Number(profile.shared) };
    };
    const loginHtmlValid = (html) => /<div\s+align=["']center["']\s*>\s*<h1>\s*Selamat Datang di Hotspot SMK Negeri 1 Amuntai\s*<\/h1>/i.test(html) && /<form\b[^>]*>[\s\S]*<\/form>/i.test(html);
    window.NetGuardChapterFour = { parameters, ssidValid, passwordValid, dnsNameValid, wirelessValid, securityValid, wifiReady, hotspotValid, profileValid, userValid, authenticate, loginHtmlValid };
})();
