<section class="ch5-connection-stage" data-ch5-stage="connect-switch" hidden aria-labelledby="ch5-connect-switch-title">
    <header><span>PC KONFIGURASI · SATU KABEL LAN</span><h2 id="ch5-connect-switch-title" data-ch5-cabling-title>Pindahkan kabel PC ke ether5 hEX</h2><p data-ch5-cabling-description>Pasang ujung kabel PC ke ether5 hEX. Ujung kabel pada LAN komputer tetap terpasang.</p></header>
    <div class="ch5-cabling-layout">
        <div class="ch5-hex-device"><img src="{{ asset('images/asset/alat/hex-lite-front-v2.png') }}" alt="MikroTik hEX lite dengan lima port Ethernet" draggable="false">
            @foreach ([1, 2, 3, 4, 5] as $port)
                <button type="button" class="ch5-hex-port ch5-hex-port--{{ $port }}" data-hex-port="ether{{ $port }}" aria-label="Port ether{{ $port }} hEX">
                    <b>ether{{ $port }}</b><span class="ch5-cable-plug" aria-hidden="true"></span>
                    <span class="ch5-cable-cue" aria-hidden="true">
                        <svg viewBox="0 0 40 70" focusable="false"><path d="M15 3h10v7h7v29H8V10h7Z" fill="#eaf8ff" stroke="currentColor" stroke-width="2"/><path d="M14 12v14m4-14v14m4-14v14m4-14v14" stroke="#e3aa35" stroke-width="2"/><path d="M13 31h14v14H13Z" fill="#54b9ea" stroke="currentColor" stroke-width="2"/><path d="M20 45v22" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>
                        <span class="ch5-cable-cue__unplug">Cabut kabel ↓</span><span class="ch5-cable-cue__insert">Pasang kabel ↑</span>
                    </span>
                </button>
            @endforeach
        </div>
        <div class="ch5-cabling-actions">
            <div class="ch5-uplink-note"><b>Uplink tetap terpasang</b><span data-ch5-trunk-label>Router hAP · ether2-vlan → ether1 hEX</span></div>
            <button type="button" class="ch5-cable-choice" data-ch5-pc-cable draggable="true" aria-pressed="false"><img src="{{ asset('images/asset/alat/rj45-single-hd.webp') }}" alt="Konektor kabel LAN PC"><span><b>Kabel LAN PC yang sama</b><small data-ch5-pc-cable-status>Pilih atau seret ke ether5 hEX</small></span></button>
            <p class="pc-lan-status" data-ch5-pc-lan-status role="status"></p>
            <button type="button" class="ch2-task-button" data-check-hex-cables disabled>Buka PC · WinBox →</button>
        </div>
    </div>
</section>
<section class="ch5-login-stage lab-stage" data-ch5-login hidden aria-label="Masuk ke MikroTik hEX melalui WinBox">
    <div class="simulation-monitor simulation-monitor--classic"><div class="simulation-monitor__screen"><div class="winbox-window wb-loader">
        <header><span class="routeros__title"><img src="{{ asset('images/logo/winbox.png') }}" alt="">WinBox (64bit) v3.41</span><span>─ □ ×</span></header><div class="routeros__menubar"><span>File</span><span>Tools</span></div>
        <div class="winbox-login"><div class="winbox-connect wb-loader__connection"><div class="winbox-credentials"><label>Connect To: <input data-ch5-connect-to aria-label="Connect To" autocomplete="off"></label><label>Login: <input data-ch5-login-name value="admin" autocomplete="off"></label><label>Password: <input data-ch5-login-password type="password" autocomplete="off"></label><div class="wb-loader__options"><label><input type="checkbox"> Keep Password</label><label><input type="checkbox"> Open In New Window</label></div><div class="wb-loader__buttons"><button class="winbox-control" type="button" disabled>Add/Set</button><button class="winbox-control" type="button" disabled>Connect To RoMON</button><button class="winbox-control" type="button" data-ch5-connect-hex>Connect</button></div></div></div>
            <div class="winbox-neighbors"><div class="winbox-neighbors__list"><div class="winbox-tabs" role="tablist" aria-label="Router list"><button type="button" role="tab" aria-selected="false" disabled>Managed</button><button type="button" role="tab" aria-selected="true">Neighbors</button></div><div class="winbox-toolbar"><button type="button" data-ch5-refresh-neighbors>Refresh</button></div><div class="winbox-table"><div class="winbox-table__head"><span>MAC Address</span><span>IP Address</span><span>Identity</span><span>Version</span><span>Board</span><span>Uptime</span></div><button type="button" data-ch5-hex-neighbor hidden><span>48:A9:8A:1C:01:05</span><span>0.0.0.0</span><span data-ch5-neighbor-identity>MikroTik</span><span>7.14.3</span><span>hEX lite</span><span>00:00:18</span></button></div></div></div>
        </div><footer class="wb-loader__status" data-ch5-neighbor-status role="status">0 items</footer>
    </div></div></div>
</section>
<section class="lab-pc-desktop ch5-management-desktop" data-ch5-management-desktop hidden aria-label="Desktop PC konfigurasi"><div class="lab-pc-apps"><button class="lab-pc-shortcut" type="button" data-ch5-desktop-winbox><img src="{{ asset('images/logo/winbox.png') }}" alt="">WinBox</button></div></section>
