import { SyairPenuh, IramaDetail, Badge, IramaId, NotaIramaDetail, SoalanKenaliIrama } from '../types/syair';

export const IRAMA_LIST: IramaDetail[] = [
  {
    id: 'dodoi',
    name: 'Irama Dodoi',
    alias: 'Alunan Lembut Mendayu-dayu',
    character: 'Mendayu-dayu, sangat perlahan, menenangkan jiwa dan penuh kasih sayang',
    description: 'Irama klasik warisan Melayu yang bertempo perlahan dan alunannya mendayu-dayu. Irama ini sangat sesuai untuk menyampaikan bait syair yang berbentuk nasihat, kasih ibu bapa, serta pembentukan akhlak mulia.',
    tempo: 'Perlahan & Mendayu-dayu',
    tempoBpm: 60,
    youtubeId: 'Ew2DqLW-xfI',
    youtubeUrl: 'https://www.youtube.com/watch?v=Ew2DqLW-xfI',
    rhythmStyle: 'Jeda nafas tenang, lenggok mengalun lembut pada suku kata berhuruf vokal panjang.',
    suitableTheme: 'Nasihat budi pekerti, kasih sayang keluarga, dan keinsafan diri.',
    tips: 'Ambil nafas pada tanda jeda pendek ( / ), lalu lepaskan suara beralun mendayu hingga berhenti penuh pada jeda ( // ).'
  },
  {
    id: 'selendang_delima',
    name: 'Irama Selendang Delima',
    alias: 'Alunan Tradisional Merdu',
    character: 'Merdu, bersahaja, berirama tenang dengan lenggok tradisional yang indah',
    description: 'Irama tradisional Melayu yang sangat masyhur dalam seni persembahan syair. Mempunyai lenggok bersahaja yang melentur indah di suku kata akhir, melatih kemahiran intonasi dan penghayatan bahasa sastera.',
    tempo: 'Sederhana & Merdu',
    tempoBpm: 70,
    youtubeId: 'sHpDFXvvY5g',
    youtubeUrl: 'https://youtu.be/sHpDFXvvY5g',
    rhythmStyle: 'Alunan naik-turun yang seimbang, harakat sederhana pada penghujung setiap baris.',
    suitableTheme: 'Semangat menuntut ilmu, adab kesopanan, dan cita-cita hidup.',
    tips: 'Lafazkan perkataan dengan sebutan baku yang jelas, kawal kerongkong pada suku kata rima akhir untuk menghasilkan lenggok yang merdu.'
  }
];

export const SYAIR_UTAMA: SyairPenuh = {
  tajuk: 'Syair Pesanan Bonda: Pelita Menuntut Ilmu',
  tema: 'Pendidikan & Budi Pekerti (Ilmu Pengetahuan dan Akhlak Mulia)',
  sasaran: 'Murid Tahun 5 Sekolah Rendah (KSSR Semakan)',
  dskp: {
    standardKandungan: 'SK 4.2 Menghayati keindahan dan kesantunan bahasa dalam bahan sastera.',
    standardPembelajaran: 'SP 4.2.1 Melafazkan dan melagukan syair dengan irama yang sesuai serta menyatakan idea keseluruhan syair.',
    aspek: 'Aspek Seni Bahasa'
  },
  pendahuluan: 'Syair ini mengandungi empat rangkap nasihat seorang bonda kepada anaknya tentang peri pentingnya menuntut ilmu dengan ikhlas, menghormati guru, memilih sahabat yang baik, dan tabah berusaha demi mencapai cita-cita.',
  rangkap: [
    {
      nombor: 1,
      tajukRangkap: 'Rangkap 1: Amanat Ilmu Pembimbing Usia',
      baris: [
        {
          textWithPauses: 'Dengarlah anakda / suatu pesanan, //',
          cleanText: 'Dengarlah anakda suatu pesanan,',
          meaning: 'Ibu memanggil anak kesayangan untuk mendengar amanat berharga.',
          syllablesCount: 10,
          endRhyme: '-an'
        },
        {
          textWithPauses: 'Menuntut ilmu / jadikan pedoman, //',
          cleanText: 'Menuntut ilmu jadikan pedoman,',
          meaning: 'Jadikan proses belajar sebagai panduan panduan hidup seharian.',
          syllablesCount: 10,
          endRhyme: '-an'
        },
        {
          textWithPauses: 'Janganlah leka / membuang zaman, //',
          cleanText: 'Janganlah leka membuang zaman,',
          meaning: 'Usah lalai atau membuang masa muda dengan aktiviti yang tidak berfaedah.',
          syllablesCount: 10,
          endRhyme: '-an'
        },
        {
          textWithPauses: 'Kelak dirimu / hidup beriman. //',
          cleanText: 'Kelak dirimu hidup beriman.',
          meaning: 'Supaya di masa hadapan menjadi insan yang teguh pegangan hidup dan berbudi.',
          syllablesCount: 10,
          endRhyme: '-an'
        }
      ],
      maksudHarafiah: 'Ibu menasihati anaknya supaya bersungguh-sungguh menuntut ilmu, menjadikannya pedoman hidup dan tidak membuang masa dengan perkara yang melalaikan.',
      ideaKeseluruhan: 'Kepentingan menuntut ilmu sejak usia muda sebagai pedoman untuk membina kehidupan yang beriman dan bermaruah.',
      kataSukar: [
        { perkataan: 'Anakda', maksud: 'Panggilan mesra kepada anak kandung.', contoh: 'Dengarlah nasihat ibu ini wahai anakda tersayang.' },
        { perkataan: 'Pedoman', maksud: 'Panduan hidup atau petunjuk arah yang betul.', contoh: 'Ajaran guru menjadi pedoman dalam menuntut ilmu.' },
        { perkataan: 'Leka', maksud: 'Lalai atau tidak memberikan perhatian kepada tanggungjawab.', contoh: 'Murid yang berdisiplin tidak leka semasa mengulang kaji pelajaran.' }
      ],
      kataKunciIdea: ['Menuntut ilmu', 'Usia muda', 'Pedoman hidup', 'Tidak membuang masa'],
      distractors: ['Bermain gajet', 'Membeli pakaian', 'Tidur seharian', 'Bercakap besar'],
      kuiz: [
        {
          id: 101,
          soalan: 'Apakah pesanan utama bonda kepada anakda dalam baris kedua rangkap ini?',
          pilihan: [
            'Menjadikan ilmu sebagai pedoman hidup',
            'Menghabiskan masa bermain permainan komputer',
            'Mencari harta kekayaan sebanyak mungkin',
            'Menunggu dewasa baru mula belajar'
          ],
          jawapanBetul: 0,
          penerangan: 'Baris kedua menyatakan "Menuntut ilmu jadikan pedoman", iaitu menjadikan ilmu panduan hidup.'
        },
        {
          id: 102,
          soalan: 'Apakah maksud perkataan "leka" dalam konteks rangkap pertama?',
          pilihan: [
            'Rajin dan bersemangat',
            'Lalai atau tidak memberikan perhatian',
            'Takut dan bimbang',
            'Pantas membuat kerja'
          ],
          jawapanBetul: 1,
          penerangan: 'Leka bermaksud lalai, asyik atau tidak menumpukan perhatian kepada tanggungjawab.'
        },
        {
          id: 103,
          soalan: 'Mengapakah kita dilarang "membuang zaman" ketika masih muda?',
          pilihan: [
            'Kerana zaman muda tidak akan berulang dan perlu diisi dengan ilmu',
            'Kerana waktu malam lebih sesuai untuk tidur',
            'Supaya guru tidak marah di dalam kelas',
            'Untuk mengumpul duit poket yang banyak'
          ],
          jawapanBetul: 0,
          penerangan: 'Masa muda sangat berharga dan tidak wajar disia-siakan dengan aktiviti melalaikan.'
        },
        {
          id: 104,
          soalan: 'Apakah kesan sekiranya murid tekun menuntut ilmu mengikut baris keempat?',
          pilihan: [
            'Menjadi murid yang sombong di sekolah',
            'Akan hidup beriman dan bermaruah di masa hadapan',
            'Dapat mengelak daripada membuat kerja rumah',
            'Mendapat ganjaran wang tunai'
          ],
          jawapanBetul: 1,
          penerangan: 'Baris keempat berbunyi "Kelak dirimu hidup beriman", iaitu menjadi insan yang teguh pegangan nilai murni.'
        },
        {
          id: 105,
          soalan: 'Apakah idea keseluruhan bagi Rangkap 1?',
          pilihan: [
            'Kepentingan menuntut ilmu sejak usia muda sebagai pedoman hidup demi membina masa depan yang beriman',
            'Anak disuruh keluar bermain bersama rakan-rakan di luar rumah',
            'Ibu meminta anak menjaga harta benda keluarga',
            'Murid dinasihatkan berpindah ke sekolah lain'
          ],
          jawapanBetul: 0,
          penerangan: 'Rangkap 1 merumuskan bahawa menuntut ilmu sejak muda adalah pedoman membina insan beriman.'
        }
      ]
    },
    {
      nombor: 2,
      tajukRangkap: 'Rangkap 2: Adab Terhadap Guru Penyuluh Budi',
      baris: [
        {
          textWithPauses: 'Hormati guru / taat berbakti, //',
          cleanText: 'Hormati guru taat berbakti,',
          meaning: 'Muliakan guru dan patuhi ajaran mereka dengan sepenuh jiwa.',
          syllablesCount: 10,
          endRhyme: '-ti'
        },
        {
          textWithPauses: 'Ilmu dicurah / ikhlas di hati, //',
          cleanText: 'Ilmu dicurah ikhlas di hati,',
          meaning: 'Guru menyampaikan ilmu dengan penuh ketulusan dan kasih sayang.',
          syllablesCount: 10,
          endRhyme: '-ti'
        },
        {
          textWithPauses: 'Adab dijaga / menyuci hati, //',
          cleanText: 'Adab dijaga menyuci hati,',
          meaning: 'Sentiasa memelihara kesopanan tingkah laku agar jiwa bersih berseri.',
          syllablesCount: 10,
          endRhyme: '-ti'
        },
        {
          textWithPauses: 'Keberkatan hidup / pasti didapati. //',
          cleanText: 'Keberkatan hidup pasti didapati.',
          meaning: 'Kehidupan akan diberkati dan urusan menuntut ilmu menjadi mudah.',
          syllablesCount: 11,
          endRhyme: '-ti'
        }
      ],
      maksudHarafiah: 'Murid perlu menghormati guru yang mencurahkan ilmu serta menjaga adab dan kesopanan semasa belajar.',
      ideaKeseluruhan: 'Menghormati guru dan menjaga adab merupakan amalan penting untuk memperoleh keberkatan ilmu.',
      kataSukar: [
        { perkataan: 'Berbakti', maksud: 'Melakukan kebaikan atau memberikan khidmat setia.', contoh: 'Murid yang baik sentiasa berbakti kepada guru dan sekolah.' }
      ],
      kataKunciIdea: ['Hormati guru', 'Taat berbakti', 'Adab dijaga', 'Keberkatan ilmu'],
      distractors: ['Ingkari arahan', 'Sombong diri', 'Menunjuk pandai', 'Memperlekeh nasihat'],
      kuiz: [
        {
          id: 201,
          soalan: 'Bagaimanakah sikap seorang murid yang baik terhadap gurunya?',
          pilihan: [
            'Menghormati guru dan taat berbakti',
            'Mendiamkan diri semasa guru bertanya soalan',
            'Hanya menghormati guru ketika peperiksaan',
            'Membantah arahan guru di hadapan rakan'
          ],
          jawapanBetul: 0,
          penerangan: 'Baris pertama jelas menyatakan agar kita menghormati guru dan taat berbakti.'
        },
        {
          id: 202,
          soalan: 'Apakah maksud perkataan "berbakti" dalam rangkap kedua?',
          pilihan: [
            'Melakukan kebaikan atau memberikan khidmat setia',
            'Berjalan ke sana ke mari',
            'Mengabaikan nasihat orang tua',
            'Mengelak daripada menghadiri kelas'
          ],
          jawapanBetul: 0,
          penerangan: 'Berbakti bererti mencurahkan khidmat setia dan melakukan kebaikan dengan ikhlas.'
        },
        {
          id: 203,
          soalan: 'Mengapakah adab perlu dijaga semasa menuntut ilmu?',
          pilihan: [
            'Untuk menyucikan jiwa dan memelihara kesopanan diri',
            'Supaya guru tidak menyuruh murid membaca',
            'Untuk bersaing dengan murid yang lain',
            'Agar dapat pulang awal dari sekolah'
          ],
          jawapanBetul: 0,
          penerangan: 'Adab yang dijaga menyucikan hati dan mendidik peribadi menjadi luhur.'
        },
        {
          id: 204,
          soalan: 'Apakah yang diperoleh jika kita menghormati guru mengikut baris keempat?',
          pilihan: [
            'Pasti memperoleh keberkatan dalam kehidupan',
            'Mendapat wang saku tambahan',
            'Dipilih menjadi ketua murid secara automatik',
            'Boleh ponteng kelas tanpa halangan'
          ],
          jawapanBetul: 0,
          penerangan: 'Keberkatan hidup dan ilmu pasti didapati apabila murid memuliakan gurunya.'
        },
        {
          id: 205,
          soalan: 'Apakah idea keseluruhan bagi Rangkap 2?',
          pilihan: [
            'Menghormati guru dan menjaga adab merupakan amalan penting untuk memperoleh keberkatan ilmu',
            'Murid perlu menghafal buku teks sepanjang malam',
            'Guru mestilah memberi markah penuh kepada semua murid',
            'Sekolah adalah tempat bermain bersama kawan'
          ],
          jawapanBetul: 0,
          penerangan: 'Rangkap 2 berfokus pada penghormatan kepada guru dan pemeliharaan adab demi berkat ilmu.'
        }
      ]
    },
    {
      nombor: 3,
      tajukRangkap: 'Rangkap 3: Memilih Sahabat Pembentuk Peribadi',
      baris: [
        {
          textWithPauses: 'Carilah taulan / berakhlak mulia, //',
          cleanText: 'Carilah taulan berakhlak mulia,',
          meaning: 'Pilihlah rakan sebaya yang memiliki budi pekerti terpuji.',
          syllablesCount: 11,
          endRhyme: '-ia'
        },
        {
          textWithPauses: 'Budi pekerti / tampak bercahaya, //',
          cleanText: 'Budi pekerti tampak bercahaya,',
          meaning: 'Perangai yang baik akan menerangi tingkah laku pergaulan.',
          syllablesCount: 11,
          endRhyme: '-ya'
        },
        {
          textWithPauses: 'Jauhi sengketa / juga bahaya, //',
          cleanText: 'Jauhi sengketa juga bahaya,',
          meaning: 'Elakkan pergaduhan, perselisihan faham, dan perkara sia-sia.',
          syllablesCount: 10,
          endRhyme: '-ya'
        },
        {
          textWithPauses: 'Nescaya hidupmu / aman berjaya. //',
          cleanText: 'Nescaya hidupmu aman berjaya.',
          meaning: 'Pasti kehidupan sentiasa tenteram, selamat dan mencapai kejayaan.',
          syllablesCount: 11,
          endRhyme: '-ya'
        }
      ],
      maksudHarafiah: 'Murid disarankan memilih sahabat yang berakhlak baik dan menjauhi persengketaan.',
      ideaKeseluruhan: 'Pemilihan sahabat yang baik serta sikap menjauhi persengketaan membantu membentuk kehidupan yang sejahtera.',
      kataSukar: [
        { perkataan: 'Taulan', maksud: 'Sahabat, rakan karib atau teman seperjuangan.', contoh: 'Bermuafakat dengan taulan menghasilkan keputusan yang bijak.' },
        { perkataan: 'Sengketa', maksud: 'Perselisihan, pertelingkahan atau perbalahan.', contoh: 'Sifat sabar dapat mengelakkan sengketa sesama rakan sekelas.' },
        { perkataan: 'Nescaya', maksud: 'Pasti atau sudah tentu.', contoh: 'Jika berusaha gigih, nescaya kejayaan akan menjadi milikmu.' }
      ],
      kataKunciIdea: ['Pilih taulan mulia', 'Budi bercahaya', 'Jauhi sengketa', 'Hidup aman berjaya'],
      distractors: ['Cari perbalahan', 'Memilih musuh', 'Menyimpan prasangka', 'Memencilkan diri'],
      kuiz: [
        {
          id: 301,
          soalan: 'Apakah kriteria sahabat yang disarankan oleh penyair?',
          pilihan: [
            'Sahabat (taulan) yang berakhlak mulia',
            'Rakan yang mempunyai banyak permainan video',
            'Kawan yang suka mengajak ponteng sekolah',
            'Rakan yang paling kaya di sekolah'
          ],
          jawapanBetul: 0,
          penerangan: 'Penyair berpesan "Carilah taulan berakhlak mulia" demi menjaga kebaikan diri.'
        },
        {
          id: 302,
          soalan: 'Apakah maksud perkataan "taulan"?',
          pilihan: [
            'Sahabat atau teman',
            'Musuh ketat',
            'Buku rujukan',
            'Jalan raya'
          ],
          jawapanBetul: 0,
          penerangan: 'Taulan ialah perkataan klasik Melayu yang membawa maksud sahabat atau rakan karib.'
        },
        {
          id: 303,
          soalan: 'Apakah perkara yang perlu dijauhi semasa berkawan mengikut baris ketiga?',
          pilihan: [
            'Sengketa (perselisihan) dan perkara berbahaya',
            'Aktiviti membaca buku di perpustakaan',
            'Sesi perbincangan kerja kumpulan',
            'Aktiviti sukan di padang'
          ],
          jawapanBetul: 0,
          penerangan: 'Penyair berpesan "Jauhi sengketa juga bahaya" bagi mengelak pergaduhan.'
        },
        {
          id: 304,
          soalan: 'Apakah erti perkataan "nescaya" dalam baris keempat?',
          pilihan: [
            'Pasti atau tentu sekali',
            'Mungkin atau ragu-ragu',
            'Tidak akan pernah',
            'Kadang-kadang sahaja'
          ],
          jawapanBetul: 0,
          penerangan: 'Nescaya membawa maksud pasti atau sudah tentu berlaku.'
        },
        {
          id: 305,
          soalan: 'Apakah idea keseluruhan bagi Rangkap 3?',
          pilihan: [
            'Pemilihan sahabat yang baik serta sikap menjauhi persengketaan membantu membentuk kehidupan yang sejahtera',
            'Murid tidak perlu mempunyai kawan di sekolah',
            'Kita hendaklah bersaing secara kasar dengan rakan',
            'Sahabat hanya dicari apabila memerlukan bantuan'
          ],
          jawapanBetul: 0,
          penerangan: 'Rangkap 3 menegaskan nilai berkawan dengan rakan berbudi pekerti demi kedamaian hidup.'
        }
      ]
    },
    {
      nombor: 4,
      tajukRangkap: 'Rangkap 4: Ketabahan Jiwa Menggapai Cita-cita',
      baris: [
        {
          textWithPauses: 'Tetapkan tekad / kukuhkan iman, //',
          cleanText: 'Tetapkan tekad kukuhkan iman,',
          meaning: 'Bulatkan niat dan mantapkan kepercayaan hati.',
          syllablesCount: 10,
          endRhyme: '-an'
        },
        {
          textWithPauses: 'Mengharung lautan / penuh cabaran, //',
          cleanText: 'Mengharung lautan penuh cabaran,',
          meaning: 'Bersedia menghadapi pelbagai liku dan ujian dalam mengejar ilmu.',
          syllablesCount: 11,
          endRhyme: '-an'
        },
        {
          textWithPauses: 'Genggamlah impian / jadi kejayaan, //',
          cleanText: 'Genggamlah impian jadi kejayaan,',
          meaning: 'Usahakan cita-cita setinggi gunung sehingga menjadi kenyataan.',
          syllablesCount: 11,
          endRhyme: '-an'
        },
        {
          textWithPauses: 'Banggakan nusa / serta watan. //',
          cleanText: 'Banggakan nusa serta watan.',
          meaning: 'Menjadi insan berjaya yang mengharumkan nama bangsa dan tanah air tercinta.',
          syllablesCount: 9,
          endRhyme: '-an'
        }
      ],
      maksudHarafiah: 'Murid hendaklah tabah menghadapi cabaran, berusaha mencapai cita-cita dan memberikan sumbangan kepada negara.',
      ideaKeseluruhan: 'Ketabahan dan kegigihan penting untuk mencapai cita-cita serta membanggakan bangsa dan negara.',
      kataSukar: [
        { perkataan: 'Watan', maksud: 'Tanah air atau negara tempat tumpah darah.', contoh: 'Sebagai warganegara Malaysia, kita wajib berbakti kepada watan.' }
      ],
      kataKunciIdea: ['Tetapkan tekad', 'Tabah hadapi cabaran', 'Genggam impian', 'Banggakan watan'],
      distractors: ['Putus asa awal', 'Takut menghadapi ujian', 'Mementingkan diri', 'Mengabaikan negara'],
      kuiz: [
        {
          id: 401,
          soalan: 'Apakah yang perlu kita tetapkan dan kukuhkan sebelum menghadapi cabaran?',
          pilihan: [
            'Menetapkan tekad dan mengukuhkan iman',
            'Menetapkan jadual bermain permainan',
            'Mengukuhkan kekuatan otot badan semata-mata',
            'Menunggu bantuan daripada orang lain'
          ],
          jawapanBetul: 0,
          penerangan: 'Baris pertama menyeru "Tetapkan tekad kukuhkan iman" sebagai asas ketabahan.'
        },
        {
          id: 402,
          soalan: 'Apakah kiasan yang digunakan untuk menggambarkan kesukaran menuntut ilmu dalam baris kedua?',
          pilihan: [
            'Mengharung lautan penuh cabaran',
            'Menaiki kapal terbang di udara',
            'Berjalan di taman bunga',
            'Membeli tiket di stesen kereta api'
          ],
          jawapanBetul: 0,
          penerangan: 'Kiasan "mengharung lautan" merujuk kepada liku-liku dan ujian berat yang perlu dihadapi.'
        },
        {
          id: 403,
          soalan: 'Apakah maksud perkataan "watan"?',
          pilihan: [
            'Tanah air atau negara tercinta',
            'Pakaian tradisional',
            'Senjata warisan',
            'Peralatan muzik'
          ],
          jawapanBetul: 0,
          penerangan: 'Watan ialah kata sastera bermaksud tanah air tempat tumpah darah kita.'
        },
        {
          id: 404,
          soalan: 'Kepada siapakah kejayaan yang dicapai itu perlu disumbangkan mengikut baris keempat?',
          pilihan: [
            'Membanggakan nusa serta watan (bangsa dan negara)',
            'Untuk menunjuk-nunjuk kepada orang asing',
            'Bagi mendapatkan sanjungan mewah',
            'Hanya untuk kegunaan diri sendiri'
          ],
          jawapanBetul: 0,
          penerangan: 'Kejayaan seorang insan sepatutnya membanggakan dan menyumbang kepada nusa serta watan.'
        },
        {
          id: 405,
          soalan: 'Apakah idea keseluruhan bagi Rangkap 4?',
          pilihan: [
            'Ketabahan dan kegigihan penting untuk mencapai cita-cita serta membanggakan bangsa dan negara',
            'Murid dinasihatkan pergi belayar ke laut',
            'Cita-cita tidak perlu diusahakan dengan bersungguh-sungguh',
            'Cabaran hidup hendaklah dielakkan'
          ],
          jawapanBetul: 0,
          penerangan: 'Rangkap 4 menegaskan bahawa tekad dan ketabahan membawa kepada kejayaan yang mengharumkan watan.'
        }
      ]
    }
  ]
};

export const IDEA_KESELURUHAN_SYAIR = {
  tajuk: 'Syair Pesanan Bonda: Pelita Menuntut Ilmu',
  ringkasan: 'Syair ini menyampaikan nasihat tentang kepentingan menuntut ilmu, menghormati guru, memilih sahabat yang baik dan tabah menghadapi cabaran demi mencapai kejayaan serta berbakti kepada negara.',
  nilaiMurni: [
    { nilai: 'Ketekunan Menuntut Ilmu', huraian: 'Mengisi usia muda dengan ilmu dan pedoman hidup.' },
    { nilai: 'Menghormati Guru', huraian: 'Mentaati guru demi keberkatan dan kesucian jiwa.' },
    { nilai: 'Memilih Sahabat Baik', huraian: 'Berkawan dengan taulan berakhlak mulia dan menjauhi sengketa.' },
    { nilai: 'Cinta Akan Negara (Patriotisme)', huraian: 'Tabah mencapai cita-cita demi mengharumkan nusa dan watan.' }
  ],
  glosariLengkap: [
    { perkataan: 'Anakda', maksud: 'Panggilan mesra kepada anak kandung.', contoh: 'Dengarlah nasihat ibu ini wahai anakda tersayang.' },
    { perkataan: 'Pedoman', maksud: 'Panduan hidup atau petunjuk arah yang betul.', contoh: 'Ajaran guru menjadi pedoman dalam menuntut ilmu.' },
    { perkataan: 'Leka', maksud: 'Lalai atau tidak memberikan perhatian.', contoh: 'Murid yang berdisiplin tidak leka semasa mengulang kaji pelajaran.' },
    { perkataan: 'Berbakti', maksud: 'Melakukan kebaikan atau memberikan khidmat.', contoh: 'Murid yang baik sentiasa berbakti kepada guru dan sekolah.' },
    { perkataan: 'Taulan', maksud: 'Sahabat atau teman.', contoh: 'Bermuafakat dengan taulan menghasilkan keputusan yang bijak.' },
    { perkataan: 'Sengketa', maksud: 'Perselisihan atau pertelingkahan.', contoh: 'Sifat sabar dapat mengelakkan sengketa sesama rakan sekelas.' },
    { perkataan: 'Nescaya', maksud: 'Pasti.', contoh: 'Jika berusaha gigih, nescaya kejayaan akan menjadi milikmu.' },
    { perkataan: 'Watan', maksud: 'Tanah air.', contoh: 'Sebagai warganegara Malaysia, kita wajib berbakti kepada watan.' }
  ]
};

export const BADGES_LIST: Badge[] = [
  {
    id: 'pujangga_muda',
    name: 'Pencinta Ilmu',
    icon: 'BookOpen',
    description: 'Menyelesaikan modul pembelajaran dan meneroka makna syair.',
    unlockedAtXp: 80,
    criteria: 'Selesaikan pembelajaran di Pondok Irama dan Bedah Makna.'
  },
  {
    id: 'jaguh_irama',
    name: 'Jaguh Irama',
    icon: 'Music',
    description: 'Berjaya memadankan rentak Irama Dodoi dan Selendang Delima dalam Padankan Irama.',
    unlockedAtXp: 180,
    criteria: 'Capai sekurang-kurangnya 3 daripada 4 jawapan betul dalam Padankan Irama.'
  },
  {
    id: 'penyusun_hikmah',
    name: 'Penyusun Hikmah',
    icon: 'Sparkles',
    description: 'Pakar membina idea keseluruhan rangkap syair dalam Tangkap Kunci Kata.',
    unlockedAtXp: 280,
    criteria: 'Selesaikan cabaran Tangkap Kunci Kata untuk kesemua rangkap.'
  },
  {
    id: 'maestro_syair',
    name: 'Maestro Syair',
    icon: 'Crown',
    description: 'Melagukan syair dengan irama yang sesuai dan melengkapkan pentaksiran karaoke.',
    unlockedAtXp: 400,
    criteria: 'Rakam lagu syair di Karaoke Pahlawan dan lengkapkan refleksi kendiri.'
  }
];

export interface PadankanIramaQuestionData {
  id: number;
  label: string;
  questionPrompt: string;
  targetIrama: IramaId;
  videoId: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  clueText: string;
  hint: string;
  correctIrama: IramaId;
  verificationStatus: 'disahkan' | 'pengesahan_guru';
  verificationNote: string;
  explanation: string;
}

export type IramaMatchQuestionData = PadankanIramaQuestionData;

export const PADANKAN_IRAMA_QUESTIONS: PadankanIramaQuestionData[] = [
  {
    id: 1,
    label: 'Audio 1 — Irama Dodoi',
    questionPrompt: 'Kenal pasti irama',
    targetIrama: 'dodoi',
    videoId: 'Ew2DqLW-xfI',
    videoUrl: 'https://youtu.be/Ew2DqLW-xfI',
    startTime: 19,
    endTime: 76,
    clueText: 'Dengarlah alunan muzik dengan teliti. Kenal pasti irama yang dimainkan, kemudian pilih jawapan yang betul!',
    hint: 'Alunan ini amat perlahan, lembut dan mendayu-dayu (00:19 - 01:16).',
    correctIrama: 'dodoi',
    verificationStatus: 'disahkan',
    verificationNote: 'Segmen disahkan: Irama Dodoi (Masa 00:19 - 01:16)',
    explanation: 'Irama Dodoi mempunyai alunan yang sangat perlahan dan mendayu-dayu, amat sesuai untuk bait syair nasihat moral.'
  },
  {
    id: 2,
    label: 'Audio 2 — Irama Selendang Delima',
    questionPrompt: 'Kenal pasti irama',
    targetIrama: 'selendang_delima',
    videoId: 'za2agXGQAeg',
    videoUrl: 'https://youtu.be/za2agXGQAeg?list=RDza2agXGQAeg',
    startTime: 8,
    endTime: 107,
    clueText: 'Dengarlah alunan muzik dengan teliti. Kenal pasti irama yang dimainkan, kemudian pilih jawapan yang betul!',
    hint: 'Alunan tradisional Melayu dengan lenggok merdu bersahaja (00:08 - 01:47).',
    correctIrama: 'selendang_delima',
    verificationStatus: 'disahkan',
    verificationNote: 'Segmen disahkan: Irama Selendang Delima (Masa 00:08 - 01:47)',
    explanation: 'Irama Selendang Delima terkenal dengan lenggok tradisional yang bersahaja, anggun dan seimbang.'
  },
  {
    id: 3,
    label: 'Audio 3 — Segmen Audio Baharu',
    questionPrompt: 'Kenal pasti irama',
    targetIrama: 'selendang_delima',
    videoId: 'fX61D-XA-6c',
    videoUrl: 'https://youtu.be/fX61D-XA-6c?list=RDfX61D-XA-6c',
    startTime: 14,
    endTime: 101,
    clueText: 'Dengarlah alunan muzik dengan teliti. Kenal pasti irama yang dimainkan, kemudian pilih jawapan yang betul!',
    hint: 'Dengar lenggok nafas dan kelajuan alunan syair pada segmen ini (00:14 - 01:41).',
    correctIrama: 'selendang_delima',
    verificationStatus: 'disahkan',
    verificationNote: 'Segmen disahkan: Irama Selendang Delima (00:14 - 01:41)',
    explanation: 'Alunan syair pada segmen ini memperlihatkan lenggok merdu bersahaja Irama Selendang Delima.'
  },
  {
    id: 4,
    label: 'Audio 4 — Segmen Audio Baharu',
    questionPrompt: 'Kenal pasti irama',
    targetIrama: 'dodoi',
    videoId: 'gCEPfMQqVtY',
    videoUrl: 'https://youtu.be/gCEPfMQqVtY?list=RDgCEPfMQqVtY',
    startTime: 62,
    endTime: 89,
    clueText: 'Dengarlah alunan muzik dengan teliti. Kenal pasti irama yang dimainkan, kemudian pilih jawapan yang betul!',
    hint: 'Perhatikan nada mendayu yang tenang dan membuai jiwa (01:02 - 01:29).',
    correctIrama: 'dodoi',
    verificationStatus: 'disahkan',
    verificationNote: 'Segmen disahkan: Irama Dodoi (01:02 - 01:29)',
    explanation: 'Alunan syair pada segmen ini mendayu-dayu dan membuai jiwa mengikut lenggok Irama Dodoi.'
  }
];

export const IRAMA_MATCH_QUESTIONS = PADANKAN_IRAMA_QUESTIONS;

export const NOTA_IRAMA_LENGKAP: Record<IramaId, NotaIramaDetail> = {
  dodoi: {
    id: 'dodoi' as const,
    nama: 'Irama Dodoi',
    gelaran: 'Alunan Lembut Pembelai Jiwa',
    motif: 'Buaian Tradisional & Tenang Malam',
    pengenalan:
      'Irama dodoi ialah irama yang lembut, perlahan dan berulang-ulang. Irama ini biasanya digunakan ketika mendodoikan bayi supaya berasa tenang dan mudah tidur. Nyanyiannya mempunyai alunan suara yang mendayu-dayu dan bersahaja.',
    ciriCiri: {
      tempo: 'Perlahan dan tenang.',
      melodi: 'Lembut, mendayu-dayu dan berulang-ulang.',
      intonasi: 'Rendah, mendatar dan tidak mempunyai perubahan nada yang ketara.',
      penyampaian: 'Memerlukan sebutan yang lembut dan kawalan nafas yang tenang.',
      fungsi: 'Menghasilkan suasana yang damai, menenangkan perasaan dan sesuai untuk bait syair nasihat serta kasih sayang.'
    },
    contohPenggunaan:
      'Sesuai untuk syair yang bertemakan kasih sayang ibu bapa, nasihat budi pekerti, dan keinsafan diri.',
    petuaMendengar:
      'Dengarkan tempo yang perlahan, alunan suara yang mendayu-dayu, dan pengulangan corak melodi yang tenang tanpa hentakan nada yang tinggi.',
    faktaMenarik:
      'Dalam budaya Melayu zaman dahulu, dendangan dodoi sering disulami pantun dan syair nasihat agar anak membesar dengan jiwa yang tenang dan budi bahasa yang mulia.'
  },
  selendang_delima: {
    id: 'selendang_delima' as const,
    nama: 'Irama Selendang Delima',
    gelaran: 'Alunan Tradisional Berlagu & Merdu',
    motif: 'Selendang Songket & Estetika Melayu',
    pengenalan:
      'Irama Selendang Delima merujuk kepada gaya irama yang dikaitkan dengan lagu atau nyanyian tradisional Melayu berjudul Selendang Delima. Dalam konteks penyampaian puisi tradisional, irama ini boleh digunakan sebagai pola melodi untuk mengalunkan rangkap syair atau teks berirama.',
    ciriCiri: {
      tempo: 'Sederhana dan mengikut alunan melodi lagu.',
      melodi: 'Berlagu, beralun dan mempunyai corak nada yang lebih jelas berbanding irama dodoi.',
      intonasi: 'Nada suara berubah mengikut melodi dan susunan kata.',
      penyampaian: 'Memerlukan kawalan suara, sebutan yang jelas dan kesesuaian antara melodi dengan lirik.',
      fungsi: 'Menjadikan penyampaian lagu atau puisi tradisional lebih menarik, berirama dan mempunyai nilai estetika Melayu.'
    },
    perananSyair:
      'Dalam persembahan syair, irama ini membantu penyampai mengekalkan alunan suara yang teratur serta memberikan penekanan pada perkataan tertentu supaya maksud dan keindahan teks lebih mudah dihayati.',
    petuaMendengar:
      'Perhatikan alunan melodi yang lebih berlagu, nada yang bervariasi mengikut susunan kata, dan tempo sederhana yang berirama indah.',
    faktaMenarik:
      'Irama ini dinamakan sempena kisah penglipur lara klasik Melayu, Selendang Delima, melambangkan kehalusan seni vokal dan lenggok sastera istana yang anggun.'
  }
};

export const SOALAN_KENALI_IRAMA: SoalanKenaliIrama[] = [
  {
    id: 1,
    soalan: 'Irama manakah yang mempunyai alunan lembut, tempo perlahan, dan asalnya digunakan ketika mendodoikan bayi agar tenang dan mudah tidur?',
    ciriUtama: 'Tempo perlahan, melodi mendayu-dayu, menenangkan jiwa',
    jawapanBetul: 'dodoi' as const,
    penerangan: 'Tepat sekali! Irama Dodoi bertempo perlahan dan alunannya mendayu-dayu untuk menghasilkan suasana damai.'
  },
  {
    id: 2,
    soalan: 'Irama manakah yang mempunyai corak nada lebih jelas, melodi beralun berlagu, dan intonasi yang berubah mengikut susunan kata?',
    ciriUtama: 'Melodi berlagu, nada bervariasi mengikut susunan kata',
    jawapanBetul: 'selendang_delima' as const,
    penerangan: 'Syabas! Irama Selendang Delima mempunyai corak nada yang lebih jelas dan berlagu berbanding irama dodoi.'
  },
  {
    id: 3,
    soalan: 'Apabila melagukan bait syair nasihat dengan intonasi rendah, mendatar, dan sebutan lembut tanpa lonjakan nada tinggi, irama apakah yang diamalkan?',
    ciriUtama: 'Intonasi rendah, mendatar tanpa perubahan nada ketara',
    jawapanBetul: 'dodoi' as const,
    penerangan: 'Hebat! Ciri intonasi rendah dan mendatar merupakan ciri khas Irama Dodoi yang menenangkan jiwa.'
  },
  {
    id: 4,
    soalan: 'Irama manakah yang membantu penyampai memberikan penekanan perkataan tertentu dengan tempo sederhana agar nilai estetika Melayu terserlah?',
    ciriUtama: 'Tempo sederhana, penekanan diksi, nilai estetika tinggi',
    jawapanBetul: 'selendang_delima' as const,
    penerangan: 'Benar! Irama Selendang Delima bertempo sederhana serta membantu mengekalkan alunan suara teratur dengan keindahan estetika.'
  }
];
