(() => {
    'use strict';
    const dnsValid = (state) => state.dns.servers.length === 2 && new Set(state.dns.servers).size === 2 && ['8.8.8.8', '8.8.4.4'].every((value) => state.dns.servers.includes(value));
    const wanReady = (state) => Boolean(state.wan.link && state.wan.bound && state.wan.defaultRoute);
    const natValid = (state) => Boolean(state.nat && !state.nat.disabled && state.nat.chain === 'srcnat' && state.nat.out === 'ether1-internet' && state.nat.action === 'masquerade');
    const routerTest = (state, target) => {
        if (!state.wan.link) return { ok: false, reason: 'link' };
        if (!state.wan.bound) return { ok: false, reason: 'wan' };
        if (!state.wan.defaultRoute) return { ok: false, reason: 'route' };
        if (target === '8.8.8.8') return { ok: true, kind: 'ip', address: target };
        if (target !== 'google.com') return { ok: false, reason: 'target' };
        if (!dnsValid(state)) return { ok: false, reason: 'dns' };
        return { ok: true, kind: 'domain', address: '198.51.100.10' };
    };
    const clientNetworkReady = (state, group) => {
        const lan = state.lan[group];
        if (!lan || !lan.ready) return false;
        const prefix = group === 'local' ? 100 : group === 'student' ? 40 : 60;
        const host = Number(lan.address.split('.').at(-1));
        const match = lan.pool.match(/^192\.168\.(\d+)\.(\d+)-192\.168\.(\d+)\.(\d+)$/);
        return lan.address.startsWith('192.168.' + prefix + '.') && Boolean(match) && Number(match[1]) === prefix && Number(match[3]) === prefix && Number(match[2]) >= 2 && Number(match[4]) <= 254 && host >= Number(match[2]) && host <= Number(match[4]) && lan.gateway === '192.168.' + prefix + '.1';
    };
    const clientTest = (state, group, target = 'google.com') => {
        const lan = state.lan[group];
        if (!clientNetworkReady(state, group)) return { ok: false, reason: 'lan' };
        const router = routerTest(state, target);
        if (!router.ok) return router;
        if (target === 'google.com' && !state.dns.remote) return { ok: false, reason: 'remote' };
        if (!natValid(state)) return { ok: false, reason: 'nat' };
        return { ok: true, address: lan.address, gateway: lan.gateway, dns: lan.gateway, targetAddress: router.address, kind: router.kind };
    };
    const clientCommand = (state, group, command) => {
        const text = command.trim().toLowerCase();
        if (/^ipconfig(?:\s+\/all)?$/.test(text)) return { ok: clientNetworkReady(state, group), kind: 'config', reason: 'lan' };
        const match = text.match(/^ping\s+(8\.8\.8\.8|google\.com)(?:\s+-n\s+4)?$/);
        if (!match) return { ok: false, reason: 'command' };
        return { kind: match[1] === '8.8.8.8' ? 'ip' : 'domain', ...clientTest(state, group, match[1]) };
    };
    window.NetGuardChapterThree = { dnsValid, wanReady, natValid, routerTest, clientTest, clientCommand };
})();
