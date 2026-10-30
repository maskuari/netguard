(() => {
    'use strict';
    const parameters = {
        ssid: 'SMKN1-Amuntai', wifiPassword: 'Sekolah123', dnsName: 'hotspot-tkj.com',
        heading: 'Selamat Datang di Hotspot SMK Negeri 1 Amuntai',
        profiles: { kepalasekolah: { shared: 1, rate: '512k/512k', password: '123' }, guru: { shared: 10, rate: '256k/256k', password: '456' }, siswa: { shared: 5, rate: '128k/128k', password: '789' } },
    };
    const wirelessValid = (state) => state.wireless.enabled && state.wireless.mode === 'ap bridge' && state.wireless.ssid === parameters.ssid;
    const securityValid = (state) => Boolean(state.security && state.security.name === 'user' && state.security.mode === 'dynamic keys' && state.security.wpa && state.security.wpa2 && state.security.key === parameters.wifiPassword && state.security.key2 === parameters.wifiPassword);
    const wifiReady = (state) => wirelessValid(state) && securityValid(state) && state.wireless.security === 'user';
    const hotspotValid = (state) => Boolean(state.hotspot && state.hotspot.interface === 'wlan1' && state.hotspot.dnsName === parameters.dnsName && state.hotspot.user === 'admin' && state.hotspot.password === 'admin');
    const profileValid = (state, name) => Boolean(parameters.profiles[name] && state.profiles[name] && Number(state.profiles[name].shared) === parameters.profiles[name].shared && state.profiles[name].rate === parameters.profiles[name].rate);
    const userValid = (state, name) => Boolean(profileValid(state, name) && state.users[name] && state.users[name].profile === name && state.users[name].password === parameters.profiles[name].password);
    const authenticate = (state, name, password, activeCount = 0) => {
        if (!wifiReady(state) || !state.phoneConnected) return { ok: false, reason: 'wifi' };
        if (!hotspotValid(state)) return { ok: false, reason: 'hotspot' };
        if (name === 'admin' && password === state.hotspot.password) return { ok: true, profile: 'default', rate: 'unlimited', shared: 1 };
        if (!userValid(state, name) || state.users[name].password !== password) return { ok: false, reason: 'credentials' };
        const profile = state.profiles[name];
        if (activeCount >= Number(profile.shared)) return { ok: false, reason: 'sessions' };
        return { ok: true, profile: name, rate: profile.rate, shared: Number(profile.shared) };
    };
    const loginHtmlValid = (html) => /<div\s+align=["']center["']\s*>\s*<h1>\s*Selamat Datang di Hotspot SMK Negeri 1 Amuntai\s*<\/h1>/i.test(html) && /<form\b[^>]*>[\s\S]*<\/form>/i.test(html);
    window.NetGuardChapterFour = { parameters, wirelessValid, securityValid, wifiReady, hotspotValid, profileValid, userValid, authenticate, loginHtmlValid };
})();
