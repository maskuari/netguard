<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sertifikat — NetGuard Academy</title>
    <link rel="icon" href="{{ asset('images/logo/logo.png') }}">
    <style>
        :root { color-scheme: light; font-family: Arial, Helvetica, sans-serif; color: #102653; background: #eaf3fc; }
        * { box-sizing: border-box; }
        body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 28px; }
        .certificate { position: relative; width: min(1120px, 100%); min-height: 720px; padding: 62px 78px; overflow: hidden; border: 12px solid #0b69d1; outline: 2px solid #f3c866; outline-offset: -24px; background: #fff; text-align: center; box-shadow: 0 24px 70px #10265326; }
        .certificate::before, .certificate::after { position: absolute; width: 260px; height: 260px; border: 1px solid #c8e2fb; border-radius: 50%; content: ''; }
        .certificate::before { top: -150px; left: -125px; box-shadow: 0 0 0 18px #f5faff, 0 0 0 19px #d8eafb, 0 0 0 38px #f5faff, 0 0 0 39px #d8eafb; }
        .certificate::after { right: -125px; bottom: -150px; box-shadow: 0 0 0 18px #f5faff, 0 0 0 19px #d8eafb, 0 0 0 38px #f5faff, 0 0 0 39px #d8eafb; }
        .brand { display: flex; align-items: center; justify-content: center; gap: 12px; color: #075fc6; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
        .brand img { width: 52px; height: 52px; object-fit: contain; }
        .eyebrow { margin: 44px 0 12px; color: #52739a; font-size: 14px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; }
        h1 { margin: 0; color: #0b2553; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(38px, 5vw, 62px); font-weight: 500; }
        .intro { margin: 20px 0 8px; color: #547092; font-size: 18px; }
        .name { margin: 10px 0 20px; color: #086bd4; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(34px, 5vw, 54px); }
        .description { max-width: 760px; margin: 0 auto; color: #344f72; font-size: 18px; line-height: 1.7; }
        .seal { display: grid; place-items: center; width: 82px; height: 82px; margin: 24px auto; border: 3px double #dfa924; border-radius: 50%; color: #dfa924; font-size: 38px; }
        .details { display: flex; justify-content: center; gap: 90px; margin-top: 34px; }
        .detail { min-width: 210px; padding-top: 12px; border-top: 1px solid #9db9d7; color: #183c69; font-size: 14px; }
        .detail b { display: block; margin-bottom: 6px; color: #7890aa; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
        .actions { margin-top: 28px; }
        .actions a, .actions button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; margin: 0 5px; padding: 0 20px; border: 1px solid #8cbce9; border-radius: 10px; color: #0a5ebc; background: white; font-size: 15px; font-weight: 700; text-decoration: none; cursor: pointer; }
        .actions button { border-color: #0878ed; color: white; background: #0878ed; }
        @media (max-width: 640px) { body { padding: 12px; } .certificate { min-height: 0; padding: 52px 25px; border-width: 8px; outline-offset: -17px; } .eyebrow { margin-top: 30px; } .description { font-size: 15px; } .details { gap: 25px; flex-wrap: wrap; } .detail { min-width: 160px; } }
        @page { size: A4 landscape; margin: 0; }
        @media print { :root { background: white; } body { min-height: 0; padding: 0; } .certificate { width: 297mm; height: 210mm; min-height: 0; padding: 18mm 22mm; border-width: 3mm; outline-offset: -6mm; box-shadow: none; print-color-adjust: exact; -webkit-print-color-adjust: exact; } .eyebrow { margin-top: 10mm; } .actions { display: none; } }
    </style>
</head>
<body>
    <main class="certificate" aria-label="Sertifikat penyelesaian Certification Mode">
        <div class="brand"><img src="{{ asset('images/logo/logo.png') }}" alt=""><span>NetGuard Academy</span></div>
        <p class="eyebrow">Sertifikat Penyelesaian · MikroTik Mission</p>
        <h1>Sertifikat Kompetensi</h1>
        <p class="intro">Dengan bangga diberikan kepada</p>
        <h2 class="name">{{ $student->name }}</h2>
        <p class="description">Telah menyelesaikan <strong>Certification Mode</strong> dan memenuhi seluruh konfigurasi serta pengujian pada simulasi jaringan MikroTik NetGuard Academy.</p>
        <div class="seal" aria-hidden="true">✓</div>
        <div class="details">
            <div class="detail"><b>Tanggal penyelesaian</b>{{ $student->certification_completed_at->locale('id')->translatedFormat('d F Y') }}</div>
            <div class="detail"><b>Nomor sertifikat</b>NGA-{{ $student->certification_completed_at->format('Y') }}-{{ str_pad((string) $student->id, 6, '0', STR_PAD_LEFT) }}</div>
        </div>
        <div class="actions"><a href="{{ route('homepage') }}">Kembali ke beranda</a><button type="button" onclick="window.print()">Cetak sertifikat</button></div>
    </main>
</body>
</html>
