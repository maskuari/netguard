(() => {
    'use strict';

    const shell = document.querySelector('.ch2-shell');
    if (!shell) return;

    const stages = ['intro', 'lesson', 'vlan', 'wan', 'addresses', 'dhcp', 'verify', 'recap', 'quiz', 'finish'];
    const panels = new Map([...document.querySelectorAll('[data-panel]')].map((panel) => [panel.dataset.panel, panel]));
    const storageKey = `netguard.chapter-two.v1.${shell.dataset.userId}`;
    const feedback = document.querySelector('[data-feedback]');
    const previous = document.querySelector('[data-previous]');
    const saveButton = document.querySelector('[data-save]');
    const persistedFields = [...document.querySelectorAll('.ch2-board input:not([type="radio"]), .ch2-board select')];
    const dialogueLines = [
        'Kerja bagus! Router dan kabel dari misi pertama sudah siap. Sekarang kita perlu memisahkan jaringan siswa dan guru.',
        'Jika semua komputer berada pada satu jaringan, pengaturan sekolah akan sulit dikelola. Kita buat VLAN 10 untuk siswa dan VLAN 20 untuk guru.',
        'Setelah itu, router akan menjadi gateway setiap segmen. DHCP Client menerima alamat dari ISP, sedangkan DHCP Server membagikan alamat ke PC sekolah.',
        'Perhatikan gambar jaringan di tengah. Pelajari materinya, lalu ikuti setiap misi sampai kedua PC memperoleh alamat yang tepat.',
    ];
    const guidance = {
        intro: { section: '§2.1–2.2', items: ['Dengarkan penjelasan Pak Amat.', 'Pahami tugas jaringan sekolah.'] },
        lesson: { section: '§2.1–2.2', items: ['Kenali fungsi VLAN, gateway, dan DHCP.', 'Lihat pemisahan siswa dan guru pada diagram.'] },
        vlan: { section: '§2.3', items: ['Buat vlan1-siswa dengan ID 10.', 'Buat vlan2-guru dengan ID 20.', 'Keduanya memakai ether2-vlan.'] },
        wan: { section: '§2.4', items: ['Buka IP → DHCP Client.', 'Pilih ether1-internet sebagai WAN.', 'Periksa status setelah aktif.'] },
        addresses: { section: '§2.5', items: ['Masukkan IP/prefix pada empat interface.', 'Cocokkan gateway dengan subnetnya.', 'Periksa alamat sebelum menyimpan.'] },
        dhcp: { section: '§2.6', items: ['Pasang server di VLAN siswa dan guru.', 'Pool harus berada pada subnet gateway.', 'Jangan bagikan alamat gateway router.'] },
        verify: { section: '§2.7', items: ['Minta alamat pada PC siswa dan guru.', 'Bandingkan subnet IP tiap PC.', 'Periksa gateway yang diterima.'] },
        recap: { section: 'Rekap Chapter 2', items: ['Ingat perbedaan DHCP Client dan Server.', 'Periksa hubungan VLAN, gateway, dan pool.'] },
        quiz: { section: 'Evaluasi Chapter 2', items: ['Jawab lima pertanyaan dari modul.', 'Perbaiki jawaban yang belum tepat.'] },
        finish: { section: 'Chapter 2 selesai', items: ['Progres sudah tersimpan di akun.', 'Kembali ke peta untuk melihat chapter berikutnya.'] },
    };

    const saved = (() => {
        try { return JSON.parse(window.localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
    })();
    const completedOnServer = shell.dataset.completed === 'true';
    const state = {
        stage: stages.includes(saved.stage) ? saved.stage : (completedOnServer ? 'finish' : 'intro'),
        highest: Math.min(stages.length - 1, Math.max(0, Number(saved.highest) || (completedOnServer ? stages.length - 1 : 0))),
        dialogue: Math.min(dialogueLines.length - 1, Math.max(0, Number(saved.dialogue) || 0)),
        clients: { student: Boolean(saved.clients?.student), teacher: Boolean(saved.clients?.teacher) },
    };
    if (completedOnServer) state.highest = stages.length - 1;
    if (stages.indexOf(state.stage) > state.highest) state.stage = stages[state.highest];

    const save = () => {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify({
                ...state,
                fields: persistedFields.map((field) => field.value),
                answers: [1, 2, 3, 4, 5].map((number) => document.querySelector(`input[name="answer-${number}"]:checked`)?.value ?? null),
            }));
            return true;
        } catch { return false; }
    };

    if (Array.isArray(saved.fields)) persistedFields.forEach((field, index) => {
        if (typeof saved.fields[index] === 'string') field.value = saved.fields[index];
    });
    if (Array.isArray(saved.answers)) saved.answers.forEach((value, index) => {
        const option = [...document.querySelectorAll(`input[name="answer-${index + 1}"]`)].find((input) => input.value === value);
        if (option) option.checked = true;
    });

    const showFeedback = (message, kind = 'info') => {
        feedback.textContent = message;
        feedback.dataset.kind = kind;
    };
    const progressFor = (highest) => Math.min(5, Math.max(0, highest - 2));
    const refreshClients = () => {
        for (const group of ['student', 'teacher']) {
            const active = state.clients[group];
            const base = group === 'student' ? '40' : '60';
            const pool = document.querySelector(`[data-pool-range="${group}"]`).value.trim().match(/^192\.168\.\d{1,3}\.(\d{1,3})/);
            const assignedHost = pool ? Number(pool[1]) : 10;
            document.querySelector(`[data-client="${group}"]`).classList.toggle('is-connected', active);
            document.querySelector(`[data-client-ip="${group}"]`).textContent = active ? `192.168.${base}.${assignedHost}` : '—';
            document.querySelector(`[data-client-gateway="${group}"]`).textContent = active ? `192.168.${base}.1` : '—';
            document.querySelector(`[data-request-ip="${group}"]`).textContent = active ? 'Perbarui alamat' : 'Minta alamat';
        }
    };
    const render = () => {
        const index = stages.indexOf(state.stage);
        panels.forEach((panel, name) => { panel.hidden = name !== state.stage; });
        document.querySelector('[data-dialogue-text]').textContent = dialogueLines[state.dialogue];
        document.querySelector('[data-dialogue-count]').textContent = `${state.dialogue + 1} / ${dialogueLines.length} · KLIK UNTUK LANJUT`;
        const progress = progressFor(state.highest);
        if (state.highest >= stages.indexOf('addresses')) {
            document.querySelector('[data-wan-status]').textContent = 'DHCP Client · bound';
            document.querySelector('[data-wan-table-status]').textContent = 'bound';
        }
        document.querySelector('[data-progress-label]').textContent = `${progress} / 5`;
        document.querySelector('[data-progress]').value = progress;
        document.querySelectorAll('[data-jump]').forEach((button) => {
            const target = stages.indexOf(button.dataset.jump);
            button.disabled = target > state.highest;
            button.classList.toggle('is-current', button.dataset.jump === state.stage);
            button.classList.toggle('is-done', target < state.highest && button.dataset.jump !== state.stage);
            button.setAttribute('aria-current', button.dataset.jump === state.stage ? 'step' : 'false');
        });
        previous.hidden = index === 0;
        const guide = guidance[state.stage];
        document.querySelector('[data-module-section]').textContent = `Chapter 2 · ${guide.section}`;
        document.querySelector('[data-guide-list]').replaceChildren(...guide.items.map((item) => {
            const li = document.createElement('li'); li.textContent = item; return li;
        }));
        refreshClients();
        document.querySelector('.ch2-main').scrollTo({ top: 0, behavior: 'auto' });
    };
    const go = (stage) => {
        const index = stages.indexOf(stage);
        if (index < 0) return;
        state.stage = stage;
        state.highest = Math.max(state.highest, index);
        save();
        render();
        showFeedback(stage === 'finish' ? 'Selamat! Chapter 2 selesai dan progres akun tersimpan.' : 'Ikuti petunjuk pada papan misi.', stage === 'finish' ? 'success' : 'info');
    };
    const success = (next, message) => {
        showFeedback(message, 'success');
        window.setTimeout(() => go(next), 700);
    };
    const normalized = (value) => value.trim().toLowerCase().replaceAll(' ', '');

    document.querySelector('[data-dialogue]').addEventListener('click', () => {
        if (state.dialogue < dialogueLines.length - 1) {
            state.dialogue++;
            save(); render();
        } else go('lesson');
    });
    document.querySelector('[data-dialogue]').addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); }
    });
    document.querySelectorAll('[data-next]').forEach((button) => button.addEventListener('click', () => go(button.dataset.next)));
    document.querySelectorAll('[data-jump]').forEach((button) => button.addEventListener('click', () => {
        if (stages.indexOf(button.dataset.jump) <= state.highest) go(button.dataset.jump);
    }));
    previous.addEventListener('click', () => go(stages[Math.max(0, stages.indexOf(state.stage) - 1)]));
    saveButton.addEventListener('click', () => {
        const didSave = save();
        showFeedback(didSave ? 'Progres tahap ini tersimpan di perangkatmu. Hasil chapter tersimpan di akun setelah evaluasi.' : 'Penyimpanan browser tidak tersedia. Selesaikan evaluasi agar hasil tersimpan di akun.', didSave ? 'success' : 'error');
    });
    persistedFields.forEach((field) => field.addEventListener('change', save));
    document.querySelectorAll('.ch2-quiz input').forEach((field) => field.addEventListener('change', save));

    document.querySelector('[data-check="vlan"]').addEventListener('click', () => {
        const student = normalized(document.querySelector('[data-vlan-name="student"]').value) === 'vlan1-siswa' && document.querySelector('[data-vlan-id="student"]').value === '10' && document.querySelector('[data-vlan-parent="student"]').value === 'ether2-vlan';
        const teacher = normalized(document.querySelector('[data-vlan-name="teacher"]').value) === 'vlan2-guru' && document.querySelector('[data-vlan-id="teacher"]').value === '20' && document.querySelector('[data-vlan-parent="teacher"]').value === 'ether2-vlan';
        if (!student || !teacher) return showFeedback('Periksa lagi: siswa = vlan1-siswa / ID 10, guru = vlan2-guru / ID 20, dan keduanya memakai ether2-vlan.', 'error');
        success('wan', 'Tepat! Dua VLAN sudah berada pada interface induk yang sama.');
    });
    document.querySelector('[data-check="wan"]').addEventListener('click', () => {
        if (document.querySelector('[data-wan-interface]').value !== 'ether1-internet') return showFeedback('Pilih ether1-internet. Itu jalur router menuju ISP.', 'error');
        document.querySelector('[data-wan-status]').textContent = 'DHCP Client · bound';
        document.querySelector('[data-wan-table-status]').textContent = 'bound';
        success('addresses', 'Benar! DHCP Client WAN menerima konfigurasi dari penyedia.');
    });
    document.querySelector('[data-check="addresses"]').addEventListener('click', () => {
        const expected = { local: '192.168.100.1/24', student: '192.168.40.1/24', teacher: '192.168.60.1/24', wireless: '192.168.20.1/24' };
        const wrong = Object.entries(expected).find(([name, ip]) => normalized(document.querySelector(`[data-address="${name}"]`).value) !== ip);
        if (wrong) return showFeedback(`Alamat untuk ${wrong[0]} belum sesuai lembar skenario. Buka petunjuk IP bila perlu.`, 'error');
        success('dhcp', 'Semua gateway terpasang pada interface dan prefix yang tepat.');
    });
    const validPool = (value, thirdOctet) => {
        const match = normalized(value).match(/^192\.168\.(\d{1,3})\.(\d{1,3})-192\.168\.(\d{1,3})\.(\d{1,3})$/);
        if (!match) return false;
        const [, fromSubnet, from, toSubnet, to] = match.map(Number);
        return fromSubnet === thirdOctet && toSubnet === thirdOctet && from >= 2 && to <= 254 && to > from;
    };
    document.querySelector('[data-check="dhcp"]').addEventListener('click', () => {
        const student = document.querySelector('[data-pool-interface="student"]').value === 'vlan1-siswa' && validPool(document.querySelector('[data-pool-range="student"]').value, 40);
        const teacher = document.querySelector('[data-pool-interface="teacher"]').value === 'vlan2-guru' && validPool(document.querySelector('[data-pool-range="teacher"]').value, 60);
        if (!student || !teacher) return showFeedback('Pool siswa harus 192.168.40.x, pool guru 192.168.60.x; pilih VLAN yang cocok dan jangan masukkan alamat gateway .1.', 'error');
        success('verify', 'DHCP Server siap membagikan alamat ke segmen siswa dan guru.');
    });
    document.querySelectorAll('[data-request-ip]').forEach((button) => button.addEventListener('click', () => {
        const group = button.dataset.requestIp;
        const card = document.querySelector(`[data-client="${group}"]`);
        card.classList.add('is-requesting');
        button.disabled = true;
        window.setTimeout(() => {
            state.clients[group] = true;
            card.classList.remove('is-requesting');
            button.disabled = false;
            save(); refreshClients();
            showFeedback(`PC ${group === 'student' ? 'siswa' : 'guru'} menerima IP dan gateway dari VLAN yang benar.`, 'success');
        }, 850);
    }));
    document.querySelector('[data-check="verify"]').addEventListener('click', () => {
        if (!state.clients.student || !state.clients.teacher) return showFeedback('Minta alamat pada kedua PC terlebih dahulu, lalu bandingkan hasilnya.', 'error');
        go('recap');
    });
    document.querySelector('[data-quiz-form]').addEventListener('submit', async (event) => {
        event.preventDefault();
        const selections = [1, 2, 3, 4, 5].map((number) => document.querySelector(`input[name="answer-${number}"]:checked`));
        if (selections.some((selection) => !selection)) return showFeedback('Jawab semua pertanyaan sebelum menyimpan hasil.', 'error');
        const answers = selections.map((selection) => Number(selection.value));
        const button = document.querySelector('[data-submit-quiz]');
        button.disabled = true;
        showFeedback('Memeriksa hasil evaluasi…');
        try {
            const response = await fetch(shell.dataset.completeUrl, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }, body: JSON.stringify({ answers }) });
            const result = await response.json();
            if (!response.ok) return showFeedback(result.message || 'Jawaban belum tepat. Coba lagi.', 'error');
            shell.dataset.completed = 'true';
            go('finish');
        } catch {
            showFeedback('Gagal menyimpan hasil. Periksa koneksi lalu coba lagi.', 'error');
        } finally { button.disabled = false; }
    });

    render();
})();
