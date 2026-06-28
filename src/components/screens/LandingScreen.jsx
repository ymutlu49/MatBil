import React, { useState, useRef, useEffect } from 'react';
import { usePWAInstall } from '../../utils';

/**
 * Tanıtım / İniş Ekranı — modern, ürün odaklı tek sayfa.
 * Siteye gelen ziyaretçinin gördüğü ilk sayfa (tarayıcıda, standalone değilken).
 *  - "Uygulamayı Yükle" → PWA kurulumu (Android/masaüstü) veya iOS yönergesi
 *  - "Tarayıcıda Başla"  → KVKK → Kitap Kodu Kapısı → Uygulama akışına geçer (onEnter)
 *
 * İçerik, "Matematiksel Bilişin Temelleri" kitabının (Prof. Dr. Yılmaz Mutlu,
 * Prof. Dr. Sinan Olkun) kuramsal çerçevesiyle hizalanmıştır.
 * Kurulu PWA olarak açıldığında App.jsx bu ekranı atlar.
 */

const STATS = [
  { value: '35', label: 'Etkileşimli Oyun' },
  { value: '6', label: 'Beceri Kategorisi' },
  { value: '8', label: 'Kuramsal Bölüm' },
];

// Erken matematiğin önemi + diskalkuli yaygınlığı — alanyazından (Butterworth 2005; Dehaene). Güven/etki bandı.
const IMPACT = [
  { value: 'Sayı hissi', label: 'Erken sayı hissi, ileri matematik başarısının en güçlü yordayıcılarından biridir.' },
  { value: 'Her çocuk', label: 'Sağlam bir niceliksel temel, her çocuğun matematik yolculuğunu kolaylaştırır.' },
  { value: '%3–6', label: 'Okul çağı çocuklarda diskalkuli (matematik öğrenme güçlüğü) görülme sıklığı.' },
];

// Platformun adını veren iki temel kavram — "Sayı Hissinden Şekil Algısına"
const CONCEPTS = [
  {
    emoji: '🔢',
    title: 'Sayı Hissi Nedir?',
    lead: 'Sayıları ve nicelikleri sezgisel olarak anlama, karşılaştırma, tahmin etme ve esnek biçimde kullanma yeteneğidir.',
    body: 'İnsan zihni daha konuşmayı öğrenmeden, nesne gruplarının "az" mı "çok" mu olduğunu sezen doğuştan bir Yaklaşık Sayı Sistemi ile gelir. Okulda öğrenilen rakamlar ve işlemler, işte bu sezgisel niceliksel temelin üzerine inşa edilir.',
    why: 'Erken sayı hissi, ileri yıllardaki matematik başarısının en güçlü yordayıcılarından biridir. Sayı ile sembol arasındaki bağın sağlam kurulamaması, diskalkulinin çekirdeğinde yer alır.',
  },
  {
    emoji: '📐',
    title: 'Şekil Algısı Nedir?',
    lead: 'Biçimleri, uzamsal ilişkileri ve geometrik özellikleri algılama, ayırt etme ve zihinde işleme yeteneğidir.',
    body: 'Zihin doğuştan iki uzamsal sistemle gelir: çevredeki konum ve mesafeyi kavrayan "düzen" geometrisi ile biçim, açı ve oranı kavrayan "nesne" geometrisi. Van Hiele modeline göre geometrik düşünme, şekli bütün olarak tanımaktan çözümleme ve çıkarsamaya doğru kademeli gelişir.',
    why: 'Uzamsal-geometrik beceriler; sayı doğrusu temsili, ölçme ve problem çözmeyle yakından ilişkilidir. Güçlü şekil algısı, ileri matematik ve STEM öğrenmesinin zeminini hazırlar.',
  },
];

// Kitabın bilimsel çerçevesini sade dille özetleyen ayırt edici noktalar
const SCIENCE = [
  {
    emoji: '🧠',
    title: 'Çekirdek Bilgi & Sayı Hissi',
    body: `İnsan zihni doğuştan bir "Yaklaşık Sayı Sistemi" ile gelir. Oyunlar bu sezgisel niceliksel temeli güçlendirerek okulda öğrenilen formal matematiğe köprü kurar.`,
  },
  {
    emoji: '🔢',
    title: 'Üçlü Kodlama Modeli',
    body: `Dehaene'nin modeline göre sayı; analog büyüklük (IPS), görsel-sembolik ve sözel-işitsel kodlarla işlenir. Her etkinlik bu kodlar arası geçişi hedefler.`,
  },
  {
    emoji: '🧱',
    title: 'Somut → Temsili → Soyut',
    body: `Kavramlar önce somut deneyimle, sonra görsel modellerle, en sonunda sembollerle sunulur. Erken matematik öğretiminde ve diskalkulide etkinliği kanıtlanmış STS/CRA öğretim sıralaması.`,
  },
  {
    emoji: '🎯',
    title: 'Sembol–Miktar Bağı',
    body: `Matematiğin çekirdeğinde sayı ile miktar arasındaki bağ yatar; bu bağ zayıf kaldığında (diskalkulide olduğu gibi) güçlük başlar. Etkinlikler bu bağı sistematik biçimde kurar ve otomatikleştirir.`,
  },
];

// Bilimsel dayanak şeridi — temel modeller ve öncü araştırmacılar
const FOUNDATIONS = [
  { tag: 'Sayı Hissi', model: 'Yaklaşık Sayı Sistemi (ANS)', who: 'Dehaene · Butterworth' },
  { tag: 'Sembolik İşleme', model: 'Üçlü Kodlama Modeli', who: 'Dehaene' },
  { tag: 'Öğretim', model: 'Somut → Temsili → Soyut', who: 'CRA · Bruner geleneği' },
  { tag: 'Geometri', model: 'Van Hiele Düşünme Düzeyleri', who: 'van Hiele' },
];

// 6 kategori — her biri kitaptaki bir kuramsal alanla ilişkili (sayılar games.js ile tutarlı)
const CATEGORIES = [
  { emoji: '👁️', name: 'Sanbil (Subitizing)', sci: 'Algısal & kavramsal anlık tanıma', n: 8 },
  { emoji: '➕', name: 'Aritmetik İşlemler', sci: 'Parça-bütün, sayı bağları, stratejiler', n: 9 },
  { emoji: '🔢', name: 'Sembolik İşleme', sci: 'Çoklu temsil ve basamak değeri', n: 5 },
  { emoji: '📐', name: 'Geometri (Van Hiele)', sci: 'Görselleştirmeden çıkarıma', n: 5 },
  { emoji: '🎲', name: 'Tahmin (Estimation)', sci: 'Nicelik, ölçü ve sayı doğrusu', n: 5 },
  { emoji: '🧠', name: 'Bilişsel Beceriler', sci: 'Çalışma belleği, inhibisyon, esneklik', n: 3 },
];

// Kitabın 8 kuramsal bölümü — uygulamadaki oyunların dayandığı temel
const CHAPTERS = [
  'Doğuştan Gelen Matematik: Çekirdek Bilgi ve Sayı Hissi',
  'Üçlü Kodlama Modeli ve Çağdaş Öğretim Yaklaşımları',
  'Sembolik Sayı İşleme: Kuramsal Temeller ve Bilişsel Zorluklar',
  'Sanbil (Subitizing) Becerisinin Erken Gelişimdeki Rolü',
  'Tahmin Becerisinin Matematik Eğitimindeki Rolü',
  'Geometri Çekirdek Bilgisi',
  'Sezgiden İspata Geçiş (Van Hiele Modeli)',
  'Geometride Pedagojik Uyarlamalar',
];

const BOOK_HIGHLIGHTS = [
  { emoji: '📚', title: '8 Kuramsal Bölüm', body: 'Sayı hissinden geometriye bütünsel bir çerçeve' },
  { emoji: '🔬', title: 'Kanıta Dayalı', body: 'Bilişsel sinirbilim ve eğitim araştırmalarına dayanır' },
  { emoji: '🎮', title: 'Kitap + Uygulama', body: '35 etkileşimli oyunla pekiştirilir' },
];

const AUDIENCES = [
  { emoji: '👩‍🏫', title: 'Öğretmenler', body: 'Sınıf ve öğrenci yönetimi, bölüm bazlı ilerleme takibi ve gelişim raporları.' },
  { emoji: '👪', title: 'Veliler', body: 'Çocuğun gelişimini izleyen sade bir panel ve ev desteği için somut öneriler.' },
  { emoji: '🧒', title: '6–12 Yaş Çocuklar', body: 'Oyunlaştırılmış, rozetli ve kademeli zorlukta keyifli bir öğrenme deneyimi.' },
];

// Yazar özgeçmişleri (kamuya açık akademik kaynaklardan derlenmiştir)
const AUTHORS = [
  {
    initials: 'SO',
    name: 'Prof. Dr. Sinan Olkun',
    role: 'Ankara Üniversitesi · Eğitim Bilimleri Fakültesi',
    bio: 'İlköğretimde matematik eğitimi doktorasını Arizona State University\'de tamamladı. Ankara Üniversitesi Temel Eğitim Bölümü öğretim üyesidir; daha önce TED Üniversitesi Eğitim Fakültesi\'nde dekanlık yaptı. Çalışmaları sayı hissinin gelişimi, çocuklarda matematiksel ve geometrik düşünme ile oyunla temel beceri öğretimine odaklanır.',
    tags: ['Sayı hissi', 'Matematiksel düşünme', 'Geometri eğitimi'],
  },
  {
    initials: 'YM',
    name: 'Prof. Dr. Yılmaz Mutlu',
    role: 'Muş Alparslan Üniversitesi · İlköğretim Matematik Eğitimi',
    bio: 'Doktora tezini diskalkuli üzerine yaptı. Diskalkuli Derneği\'nin yönetim kurulu başkanıdır. Çok duyulu öğretim için DokunSay sayı, aritmetik ve saat materyallerini tasarladı; çalışmaları diskalkuli, eğitsel sinirbilim ve bilgisayar destekli öğretimi kapsar.',
    tags: ['Diskalkuli', 'Eğitsel sinirbilim', 'Öğretim materyali tasarımı'],
  },
];

const FAQS = [
  {
    q: 'MatBiliş kimler için uygun?',
    a: `6–12 yaş çocuklar başta olmak üzere öğretmenler, özel eğitimciler ve veliler için. Hem tüm çocuklara erken matematik zenginleştirmesi hem de güçlük yaşayan çocuklara hedefli destek sunar.`,
  },
  {
    q: 'Diskalkuli (matematik öğrenme güçlüğü) nedir?',
    a: `Zekâ normal düzeyde olmasına rağmen sayıları, nicelikleri ve aritmetiği öğrenmede yaşanan kalıcı güçlüktür. Okul çağı çocukların yaklaşık %3–6'sını etkiler ve çoğu zaman fark edilmeden kalır.`,
  },
  {
    q: 'Uygulamaya nasıl erişilir?',
    a: `Uygulama içeriği, kitabınızla birlikte gelen kitap kodu ile açılır. Kodu girdikten sonra tüm oyunlara ve takip paneline erişebilirsiniz.`,
  },
  {
    q: 'İnternet bağlantısı olmadan çalışır mı?',
    a: `Evet. Uygulamayı cihazınıza yükleyerek (PWA) çevrimdışı kullanabilirsiniz; ilk açılıştan sonra internet gerekmez.`,
  },
  {
    q: 'Hangi cihazlarda kullanılabilir?',
    a: `Tarayıcısı olan her cihazda. Android, iPhone/iPad ve masaüstüne uygulama olarak da eklenebilir.`,
  },
  {
    q: 'Oyunlar gerçekten bilimsel temelli mi?',
    a: `Evet. Her etkinlik, kitabın kuramsal bölümlerine ve matematiksel bilişe dair güncel araştırma bulgularına (sayı hissi, üçlü kodlama, Van Hiele vb.) dayanır.`,
  },
];

// Kitabın önsözünden (yazarların kendi metni). Genel çerçeveyi pekiştirir, site içeriğini zenginleştirir.
const PREFACE = [
  `Matematik, insan zihninin en görkemli yapılarından biridir. Peki bu yapı, yalnızca okul sıralarında öğrendiğimiz sembol ve kurallardan mı ibarettir, yoksa kökleri çok daha derinde, zihnimizin doğuştan gelen mimarisinde mi yatmaktadır? Elinizdeki bu kitap, "Matematiksel Bilişin Temelleri", ikinci görüşün güçlü bir savunucusudur. Ancak bu savunuyu bir adım öteye taşır: Bu sayfalar arasında, matematiksel düşüncenin sadece kültürel bir icat olmadığını; aksine, Sayı Hissi ve Şekil Algısı olarak adlandırdığımız iki temel bilişsel çekirdek üzerine inşa edildiğini keşfedeceğiniz bir yolculuğa çıkacaksınız.`,
  `Bu yolculuğun en önemli farkı ise şudur: Bu temel sistemlerdeki (Sayı Hissi gibi) zayıflıklar Matematik Öğrenme Güçlüklerini (MÖG) anlamak için bir anahtar sunarken, aynı sistemlerin güçlendirilmesi, normal gelişim gösteren tüm çocukların matematiksel potansiyelini en üst düzeye çıkarmak için pedagojik bir harita sunar.`,
  `Yolculuğumuzun ilk durağı, "sayı"nın kendisidir. Bölüm 1'de, en temel "Çekirdek Bilgi Sistemleri"ni inceleyerek sayı hissinin doğuştan gelen kökenlerine iniyoruz. Buradan, Bölüm 2'de, beynimizin bu sayısal bilgiyi nasıl işlediğini gösteren sinirbilimsel bir harita olan "Üçlü Kodlama Modeli"ni ele alıyoruz. Bölüm 3'te, bu sezgisel algıdan kültürel olarak öğrendiğimiz "sembolik" dünyaya nasıl geçtiğimizi ve bu geçişte yaşanan bilişsel zorlukları tartışıyoruz. Bu temeli, Bölüm 4'te "Sanbil" (şipşak sayılama) ve Bölüm 5'te "Tahmin" becerisi gibi sayısal düşünmenin olgunlaşmasını sağlayan kritik becerilerin incelenmesiyle sağlamlaştırıyoruz.`,
  `Ancak matematik, sadece sayılardan ibaret değildir. Kitabımızın ikinci yarısında, matematiğin diğer temel direği olan "uzam" ve "şekil" algısına odaklanıyoruz. Bölüm 6'da tıpkı sayıda olduğu gibi, "Geometri Çekirdek Bilgisinin" de doğuştan gelen temellerini ve uzamsal bilişin önemini ortaya koyuyoruz. Bölüm 7'de, bu ham sezgilerin nasıl olup da formal ispata dönüştüğünü "van Hiele Düzeyleri" modeli üzerinden, yani pedagojik bir bakış açısıyla inceliyoruz.`,
  `Nihayetinde, Bölüm 8 ile tüm bu teorik ve bilişsel ilkeleri bir araya getiriyoruz. Bu bölümde, öğrenme güçlüklerinin temelindeki bilişsel zayıflıkları "teşhis" etmenin ötesine geçiyoruz. Bu bilişsel ilkeleri, tüm öğrencilere yönelik evrensel pedagojik stratejilere nasıl "uyarlayabileceğimizi" ve sezgiden ispata uzanan bu karmaşık yolda her çocuğa nasıl rehberlik edebileceğimizi tartışıyoruz.`,
  `Bu kitap, sayı ve şekil algısının zihnimizde nasıl filizlendiğini, geliştiğini ve olgunlaştığını anlamak isteyen bilişsel psikologlar ve sinirbilimciler için olduğu kadar; bu bilgiyi uygulanabilir sınıf içi stratejilere dönüştürmek isteyen eğitimciler ve çocuklarının matematiksel potansiyelini keşfetmek isteyen ebeveynler için de bir rehber niteliğindedir.`,
];
const PREFACE_CLOSING = `Sizi, matematiğin temellerine doğru bilişsel bir keşfe davet ediyoruz.`;

const NAV_LINKS = [
  { id: 'kavramlar', label: 'Kavramlar' },
  { id: 'bilim', label: 'Bilim' },
  { id: 'oyunlar', label: 'Oyunlar' },
  { id: 'kitap', label: 'Kitap' },
  { id: 'yazarlar', label: 'Yazarlar' },
  { id: 'sss', label: 'SSS' },
  { id: 'siparis', label: 'Sipariş' },
];

// Sipariş formu, ziyaretçinin kendi e-posta uygulamasıyla doğrudan yazara ulaşır (üçüncü taraf sunucu yok)
const ORDER_EMAIL = 'sinanolkun@gmail.com';
const ORDER_RECIPIENTS = ORDER_EMAIL;

// Bölüm başına yumuşak kaydırma (kaydırma kabı .scroll-area olduğundan scrollIntoView kullanılır)
const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Görünüm alanına girince içeriği yumuşakça beliren sarmalayıcı (IntersectionObserver yoksa hemen gösterir)
const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  );
};

// Hero'daki ürün önizleme kartı — uygulamanın kategori kutucuklarını taklit eder (görsel gerekmeden ürün hissi)
const AppMock = () => (
  <div className="relative mx-auto w-full max-w-sm">
    <div className="absolute -inset-6 bg-white/10 blur-3xl rounded-[2.5rem]" aria-hidden="true" />
    <div className="relative bg-white rounded-[1.75rem] shadow-2xl ring-1 ring-black/5 p-4 rotate-1">
      <div className="flex items-center gap-1.5 px-1 pb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-xs font-extrabold text-slate-400 tracking-tight">MatBiliş</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {CATEGORIES.map((c) => (
          <div key={c.name} className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
            <div className="text-2xl leading-none">{c.emoji}</div>
            <div className="text-[11px] font-bold text-slate-700 mt-1.5 leading-tight">{c.name.split(' ')[0]}</div>
            <div className="text-[10px] text-indigo-500 font-semibold mt-0.5">{c.n} oyun</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Yapışkan üst gezinme çubuğu
const NavBar = ({ onEnter }) => {
  const base = import.meta.env.BASE_URL;
  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between gap-4">
        <button onClick={() => scrollToId('top')} className="flex items-center gap-2 shrink-0">
          <img src={`${base}icon-192.png`} alt="MatBiliş simgesi" className="w-9 h-9 rounded-xl shadow-sm" width="36" height="36" />
          <span className="font-extrabold text-slate-800 tracking-tight">MatBiliş</span>
        </button>
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollToId(l.id)}
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={onEnter}
          className="shrink-0 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Başla
        </button>
      </div>
    </nav>
  );
};

// Sıkça Sorulan Sorular — akordeon
const Faq = () => {
  const [open, setOpen] = useState(0);
  return (
    <div className="max-w-3xl mx-auto divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
      {FAQS.map((f, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-slate-800 text-sm sm:text-base">{f.q}</span>
            <span className={`text-indigo-600 text-2xl leading-none shrink-0 transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`}>+</span>
          </button>
          {open === i && (
            <div className="px-5 pb-5 -mt-1 text-sm text-slate-600 leading-relaxed anim-fade">{f.a}</div>
          )}
        </div>
      ))}
    </div>
  );
};

// Doğrudan iletişim kartı — mailto çalışmayan cihazlar için adres görünür ve kopyalanabilir.
const ContactEmail = () => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ORDER_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { setCopied(false); }
  };
  const mailto = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent('Kitap Siparişi — Matematiksel Bilişin Temelleri')}`;
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
      <p className="text-sm font-semibold text-slate-700 mb-1">Doğrudan iletişim</p>
      <p className="text-xs text-slate-500 mb-3">
        Formu kullanmak istemezseniz sipariş ve sorularınız için doğrudan e-posta gönderebilir
        ya da adresi kopyalayabilirsiniz.
      </p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <a
          href={mailto}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all"
        >
          <span>✉️</span><span className="break-all">{ORDER_EMAIL}</span>
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 active:scale-[0.98] transition-all shrink-0"
        >
          <span>{copied ? '✓' : '📋'}</span><span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
        </button>
      </div>
    </div>
  );
};

const OrderForm = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', address: '', quantity: '1', note: '',
  });
  const [opened, setOpened] = useState(false);
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = `Kitap Siparişi — ${form.name}`.trim();
    const body = [
      'Matematiksel Bilişin Temelleri — Kitap Sipariş Talebi',
      '',
      `Ad Soyad : ${form.name}`,
      `E-posta  : ${form.email}`,
      `Telefon  : ${form.phone}`,
      `Şehir    : ${form.city}`,
      `Adet     : ${form.quantity}`,
      `Adres    : ${form.address}`,
      `Not      : ${form.note}`,
    ].join('\n');
    window.location.href = `mailto:${ORDER_RECIPIENTS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  const INPUT = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition';
  const LABEL = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Ad Soyad <span className="text-rose-500">*</span></label>
          <input type="text" required value={form.name} onChange={update('name')} className={INPUT} placeholder="Adınız ve soyadınız" />
        </div>
        <div>
          <label className={LABEL}>E-posta <span className="text-rose-500">*</span></label>
          <input type="email" required value={form.email} onChange={update('email')} className={INPUT} placeholder="ornek@eposta.com" />
        </div>
        <div>
          <label className={LABEL}>Telefon <span className="text-rose-500">*</span></label>
          <input type="tel" required value={form.phone} onChange={update('phone')} className={INPUT} placeholder="05xx xxx xx xx" />
        </div>
        <div>
          <label className={LABEL}>Şehir</label>
          <input type="text" value={form.city} onChange={update('city')} className={INPUT} placeholder="İl / ilçe" />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL}>Açık Adres <span className="text-rose-500">*</span></label>
          <textarea required rows={2} value={form.address} onChange={update('address')} className={INPUT} placeholder="Teslimat adresiniz" />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL}>Adet</label>
          <input type="number" min="1" value={form.quantity} onChange={update('quantity')} className={`${INPUT} sm:w-32`} />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL}>Not (isteğe bağlı)</label>
          <textarea rows={3} value={form.note} onChange={update('note')} className={INPUT} placeholder="Eklemek istedikleriniz" />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full py-4 px-5 bg-indigo-600 text-white rounded-2xl shadow-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.99] transition-all"
          >
            <span className="text-xl">✉️</span>
            <span>E-posta ile Sipariş Gönder</span>
          </button>
        </div>
      </form>

      {opened && (
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 anim-fade">
          <p className="font-semibold mb-1">E-posta uygulamanız açıldı.</p>
          <p className="leading-relaxed">
            Siparişinizi tamamlamak için açılan e-postayı <span className="font-semibold">göndermeniz</span> yeterlidir.
            Uygulama açılmadıysa siparişinizi doğrudan{' '}
            <a href={`mailto:${ORDER_EMAIL}`} className="font-semibold underline break-all">{ORDER_EMAIL}</a>{' '}
            adresine iletebilirsiniz.
          </p>
        </div>
      )}

      <p className="text-xs text-slate-400 leading-relaxed mt-4">
        🔒 Form bilgileriniz yalnızca siparişinizi iletmek üzere kendi e-posta uygulamanız aracılığıyla
        doğrudan yazara gönderilir; herhangi bir sunucuda toplanmaz veya saklanmaz.
      </p>
    </div>
  );
};

const SectionHead = ({ eyebrow, title, children }) => (
  <div className="text-center max-w-2xl mx-auto mb-12">
    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">{eyebrow}</p>
    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
    {children && <p className="text-base text-slate-600 mt-4 leading-relaxed">{children}</p>}
  </div>
);

const LandingScreen = ({ onEnter }) => {
  const { canInstall, isIOS, isStandalone, installed, promptInstall } = usePWAInstall();
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const base = import.meta.env.BASE_URL;

  const handleInstallClick = async () => {
    if (canInstall) {
      await promptInstall();
      return;
    }
    setShowInstallHelp((v) => !v);
  };

  return (
    <div className="h-screen bg-white text-slate-800 overflow-y-auto scroll-area">
      <NavBar onEnter={onEnter} />

      {/* ═══════ HERO ═══════ */}
      <header id="top" className="relative overflow-hidden bg-gradient-to-b from-indigo-600 via-indigo-600 to-violet-700 text-white scroll-mt-16">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 18% 18%, white 0, transparent 42%), radial-gradient(circle at 88% 8%, white 0, transparent 38%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-5 pt-14 pb-12 sm:pt-20 sm:pb-16 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Sol: metin */}
          <div className="text-center lg:text-left">
            <p className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-widest text-indigo-100 bg-white/10 rounded-full px-3 py-1 mb-5">
              Bilimsel Temelli Matematik Öğrenme Platformu
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Matematiksel Bilişin Temelleri
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-indigo-100 mt-4">
              Sayı Hissinden Şekil Algısına
            </p>
            <p className="text-base sm:text-lg text-indigo-50/90 max-w-xl mx-auto lg:mx-0 mt-5 leading-relaxed">
              Her çocuğun matematiksel düşünme ve sayı hissi temellerini güçlendiren; bilişsel
              sinirbilim ve eğitim araştırmalarına dayanan oyunlaştırılmış öğrenme platformu.
              Diskalkuli (matematik öğrenme güçlüğü) yaşayan çocuklar için de güçlü bir destek.
            </p>

            {/* CTA'lar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-8 max-w-md mx-auto lg:mx-0">
              {!isStandalone && (
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-4 px-5 bg-white text-indigo-700 rounded-2xl shadow-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-indigo-50 active:scale-[0.98] transition-all"
                >
                  <span className="text-xl">{installed ? '✅' : '📲'}</span>
                  <span>{installed ? 'Uygulama Yüklendi' : 'Uygulamayı Yükle'}</span>
                </button>
              )}
              <button
                onClick={onEnter}
                className="flex-1 py-4 px-5 bg-indigo-500/40 text-white border-2 border-white/40 rounded-2xl shadow-sm font-bold text-base flex items-center justify-center gap-2 hover:bg-indigo-500/60 active:scale-[0.98] transition-all"
              >
                <span className="text-xl">🚀</span>
                <span>Tarayıcıda Başla</span>
              </button>
            </div>

            {/* Kurulum yönergesi */}
            {showInstallHelp && !canInstall && !isStandalone && (
              <div className="max-w-md mx-auto lg:mx-0 mt-4 bg-white/95 text-slate-700 border border-white/40 rounded-2xl p-4 text-left anim-fade">
                {isIOS ? (
                  <div className="text-sm leading-relaxed">
                    <div className="font-bold text-indigo-700 mb-1">{'iPhone / iPad\'e ekle'}</div>
                    Safari{"'"}de alttaki <span className="font-semibold">Paylaş</span> {'(⬆️)'} düğmesine dokun,
                    ardından <span className="font-semibold">{'"Ana Ekrana Ekle"'}</span> seçeneğini seç.
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed">
                    <div className="font-bold text-indigo-700 mb-1">Masaüstü / Android</div>
                    Tarayıcının adres çubuğundaki <span className="font-semibold">yükle</span> simgesine
                    ya da menüden <span className="font-semibold">{'"Uygulamayı yükle"'}</span> seçeneğine dokun.
                  </div>
                )}
              </div>
            )}

            {/* Güven satırı */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start mt-7 text-sm text-indigo-100/90">
              <span className="inline-flex items-center gap-1.5"><span className="text-emerald-300">✓</span> Bilimsel temelli</span>
              <span className="inline-flex items-center gap-1.5"><span className="text-emerald-300">✓</span> 35 etkileşimli oyun</span>
              <span className="inline-flex items-center gap-1.5"><span className="text-emerald-300">✓</span> Çevrimdışı çalışır</span>
            </div>
          </div>

          {/* Sağ: ürün önizleme */}
          <div className="order-first lg:order-last">
            <AppMock />
          </div>
        </div>

        {/* İstatistikler */}
        <div className="relative max-w-4xl mx-auto px-5 pb-14 sm:pb-16">
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-2xl py-4 text-center backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-extrabold">{s.value}</div>
                <div className="text-[11px] sm:text-xs text-indigo-100 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ═══════ NEDEN ÖNEMLİ (ETKİ BANDI) ═══════ */}
      <section id="neden" className="scroll-mt-20 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <Reveal>
            <SectionHead eyebrow="Neden önemli?" title="Erken matematik temelleri geleceği belirler">
              Sayı hissi gibi erken beceriler, ileri yıllardaki matematik başarısının güçlü
              yordayıcılarıdır ve her çocukta güçlendirilebilir. Diskalkuli yaşayan çocuklarda ise
              erken ve hedefli destek özellikle kritiktir.
            </SectionHead>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {IMPACT.map((s) => (
                <div key={s.label} className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-extrabold text-indigo-700">{s.value}</div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-6">
              Kaynak: alanyazın (Butterworth, 2005; Dehaene). Yaygınlık oranı tanı ölçütüne göre değişir.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════ TEMEL KAVRAMLAR: SAYI HİSSİ & ŞEKİL ALGISI ═══════ */}
      <section id="kavramlar" className="scroll-mt-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <Reveal>
            <SectionHead eyebrow="Temel Kavramlar" title="Sayı Hissinden Şekil Algısına">
              Matematik öğrenmenin iki temel taşı. Kitap ve uygulama, ikisini de erken yaşta ve
              sağlam bir bilimsel zeminde geliştirmeyi hedefler.
            </SectionHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CONCEPTS.map((c) => (
                <article key={c.title} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
                    {c.emoji}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">{c.title}</h3>
                  <p className="text-sm font-semibold text-indigo-700 mt-2 leading-relaxed">{c.lead}</p>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">{c.body}</p>
                  <div className="mt-4 bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">Matematik öğrenmedeki önemi</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{c.why}</p>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ BİLİMSEL TEMEL ═══════ */}
      <section id="bilim" className="scroll-mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <Reveal>
            <SectionHead eyebrow="Neden farklı?" title="Oyun değil, kuram temelli müdahale">
              Her etkinlik, matematiksel bilişin nasıl geliştiğine dair güncel araştırma bulgularına dayanır.
              Eğlenceli yüzeyinin altında titiz bir bilimsel çerçeve vardır.
            </SectionHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SCIENCE.map((s) => (
                <div key={s.title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center text-2xl">
                    {s.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{s.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-1">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bilimsel dayanak şeridi */}
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3 text-center sm:text-left">Dayandığı modeller</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {FOUNDATIONS.map((f) => (
                  <div key={f.tag} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">{f.tag}</p>
                    <p className="text-sm font-bold text-slate-800 mt-1 leading-snug">{f.model}</p>
                    <p className="text-xs text-slate-500 mt-1">{f.who}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ OYUNLAR / KATEGORİLER ═══════ */}
      <section id="oyunlar" className="scroll-mt-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <Reveal>
            <SectionHead eyebrow="35 oyun, 6 kategori" title="Sayı hissinden geometriye">
              Kademeli zorluk seviyeleri ve anlık geri bildirimle, temel matematik becerilerinin tüm yapı taşlarını kapsar.
            </SectionHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((c) => (
                <div key={c.name} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center text-2xl">
                      {c.emoji}
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded-full px-2.5 py-1">{c.n} oyun</span>
                  </div>
                  <h3 className="font-bold text-slate-900">{c.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mt-0.5">{c.sci}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ KİTAP HAKKINDA ═══════ */}
      <section id="kitap" className="scroll-mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <Reveal>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Kitap kapağı */}
              <div className="order-last lg:order-first">
                <img
                  src={`${base}kitap-kapak.jpg`}
                  alt="Matematiksel Bilişin Temelleri — Sayı Hissinden Şekil Algısına (Prof. Dr. Yılmaz Mutlu, Prof. Dr. Sinan Olkun)"
                  width="900"
                  height="1350"
                  loading="lazy"
                  className="w-full max-w-xs mx-auto rounded-2xl shadow-2xl ring-1 ring-black/10"
                />
              </div>

              {/* Açıklama + öne çıkanlar */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Kitap Hakkında</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Kuramı sınıfla buluşturan başvuru kitabı</h2>
                <p className="text-base text-slate-600 mt-4 leading-relaxed">
                  Erken matematik becerileri ve matematiksel biliş alanında, kuramsal temelleri sınıf içi
                  uygulamayla buluşturur; diskalkuli dahil güçlük yaşayan çocuklara yönelik müdahaleleri de
                  kapsar. Öğretmenler, özel eğitimciler, akademisyenler ve veliler için yazılmıştır;
                  bu dijital uygulama da kitabın etkileşimli uzantısıdır.
                </p>
                <div className="space-y-3 mt-6">
                  {BOOK_HIGHLIGHTS.map((h) => (
                    <div key={h.title} className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">{h.emoji}</span>
                      <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{h.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{h.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => scrollToId('siparis')}
                  className="mt-7 inline-flex items-center gap-2 py-3 px-6 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all"
                >
                  <span>📦</span> Kitabı Sipariş Et
                </button>
              </div>
            </div>

            {/* İçindekiler */}
            <div className="mt-14">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-4 text-center">İçindekiler — 8 Bölüm</p>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHAPTERS.map((title, i) => (
                  <li key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
                    <span className="w-7 h-7 shrink-0 rounded-lg bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm text-slate-700 leading-snug">{title}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Kitaptan — Önsöz */}
            <div className="mt-14 max-w-3xl mx-auto">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-7 sm:p-10 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 text-center">Kitaptan — Önsöz</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center">Matematiğin köklerine bilişsel bir keşif</h3>
                <div className="space-y-4 mt-6">
                  <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium">{PREFACE[0]}</p>
                  {PREFACE.slice(1).map((para, i) => (
                    <p key={i} className="text-[15px] sm:text-base text-slate-600 leading-relaxed">{para}</p>
                  ))}
                  <p className="text-base sm:text-lg text-indigo-700 font-semibold leading-relaxed pt-1">{PREFACE_CLOSING}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ KİMLER İÇİN ═══════ */}
      <section id="kimler" className="scroll-mt-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <Reveal>
            <SectionHead eyebrow="Kimler için?" title="Öğretmen, veli ve çocuk" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {AUDIENCES.map((a) => (
                <div key={a.title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">{a.emoji}</div>
                  <h3 className="font-bold text-slate-900">{a.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1">{a.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ YAZARLAR ═══════ */}
      <section id="yazarlar" className="scroll-mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <Reveal>
            <SectionHead eyebrow="Yazarlar" title="Alanın öncü isimleri">
              Kitap ve uygulama, matematik eğitimi, matematiksel biliş ve diskalkuli alanında uzun
              yıllara dayanan akademik araştırma birikiminin ürünüdür.
            </SectionHead>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {AUTHORS.map((a) => (
                <article key={a.name} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl font-extrabold shadow-md">
                      {a.initials}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 leading-tight">{a.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">{a.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{a.bio}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {a.tags.map((t) => (
                      <span key={t} className="text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full px-2.5 py-1">{t}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ SSS ═══════ */}
      <section id="sss" className="scroll-mt-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <Reveal>
            <SectionHead eyebrow="Sıkça Sorulan Sorular" title="Aklınızdaki sorular" />
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* ═══════ KİTAP SİPARİŞİ ═══════ */}
      <section id="siparis" className="scroll-mt-20 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
          <Reveal>
            <SectionHead eyebrow="Kitap Siparişi" title="Kitabı edinmek ister misiniz?">
              Aşağıdaki formu doldurun; sipariş talebiniz e-posta uygulamanız üzerinden doğrudan
              yazara iletilsin. Size en kısa sürede dönüş yapılacaktır.
            </SectionHead>
            <div className="max-w-2xl mx-auto">
              <OrderForm />
              <div className="mt-5">
                <ContactEmail />
              </div>
              <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl shrink-0">🔑</span>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Kitabınız zaten var mı? Uygulama, kitabınızın iç kapağındaki <span className="font-semibold">kitap kodu</span> ile açılır.
                  Kodunuzla ilgili bilgi için{' '}
                  <a href="https://sayihissi.com" target="_blank" rel="noreferrer" className="font-semibold underline">sayihissi.com</a>.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ KAPANIŞ CTA ═══════ */}
      <section className="bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 pb-16 sm:pb-24">
          <Reveal>
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 sm:p-14 text-center text-white shadow-xl">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, white 0, transparent 40%), radial-gradient(circle at 85% 10%, white 0, transparent 35%)' }}
              />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Hemen keşfetmeye başla</h2>
                <p className="text-base text-indigo-100 mt-3 max-w-xl mx-auto">
                  Kurulum gerekmeden tarayıcıdan dene; ya da uygulamayı cihazına ekleyerek çevrimdışı da kullan.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7 max-w-md mx-auto">
                  <button
                    onClick={onEnter}
                    className="flex-1 py-4 px-5 bg-white text-indigo-700 rounded-2xl shadow-lg font-bold text-base hover:bg-indigo-50 active:scale-[0.98] transition-all"
                  >
                    🚀 Tarayıcıda Başla
                  </button>
                  {!isStandalone && (
                    <button
                      onClick={handleInstallClick}
                      className="flex-1 py-4 px-5 bg-indigo-500/40 text-white border-2 border-white/40 rounded-2xl font-bold text-base hover:bg-indigo-500/60 active:scale-[0.98] transition-all"
                    >
                      📲 Uygulamayı Yükle
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={`${base}icon-192.png`} alt="MatBiliş simgesi" className="w-9 h-9 rounded-xl" width="36" height="36" />
                <span className="font-extrabold text-white">MatBiliş</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                {'"Matematiksel Bilişin Temelleri"'} kitabının etkileşimli dijital uzantısı.
                Her çocuk için erken matematik ve sayı hissi; diskalkuli desteği dahil, bilimsel temelli öğrenme.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Sayfa</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {NAV_LINKS.map((l) => (
                  <li key={l.id}>
                    <button onClick={() => scrollToId(l.id)} className="hover:text-white transition-colors">{l.label}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">İletişim</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href={`mailto:${ORDER_EMAIL}`} className="hover:text-white transition-colors break-all">{ORDER_EMAIL}</a>
                </li>
                <li><a href={`${base}privacy.html`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Gizlilik Politikası</a></li>
                <li><a href="https://sayihissi.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">sayihissi.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate-400">Tasarım: Prof. Dr. Yılmaz Mutlu</p>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} MatBiliş — Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingScreen;
