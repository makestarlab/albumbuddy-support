import { ref } from 'vue';

export type Lang = 'ko' | 'en' | 'ja' | 'zh-CN';

export const langLabels: Record<Lang, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  'zh-CN': '简体中文',
};

export const currentLang = ref<Lang>('en');

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  Notices: { ko: '공지사항', en: 'Notices', ja: 'お知らせ', 'zh-CN': '公告' },
  FAQ: { ko: 'FAQ', en: 'FAQ', ja: 'FAQ', 'zh-CN': 'FAQ' },
  'Contact Us': { ko: '문의하기', en: 'Contact Us', ja: 'お問い合わせ', 'zh-CN': '联系我们' },

  // Hero
  '무엇을 도와드릴까요?': {
    ko: '무엇을 도와드릴까요?',
    en: 'How can we help you?',
    ja: 'どのようにお手伝いできますか？',
    'zh-CN': '我们能为您提供什么帮助？',
  },
  '검색어를 입력하세요': {
    ko: '검색어를 입력하세요',
    en: 'Search for answers...',
    ja: '検索キーワードを入力してください',
    'zh-CN': '搜索...',
  },

  // Home categories
  '주문 및 결제': {
    ko: '주문 및 결제',
    en: 'Orders & Payment',
    ja: '注文・お支払い',
    'zh-CN': '订单与支付',
  },
  배송: { ko: '배송', en: 'Shipping', ja: '配送', 'zh-CN': '配送' },
  '앨범 및 상품': {
    ko: '앨범 및 상품',
    en: 'Albums & Products',
    ja: 'アルバム・商品',
    'zh-CN': '专辑与产品',
  },
  계정: { ko: '계정', en: 'Account', ja: 'アカウント', 'zh-CN': '账户' },
  '환불 및 교환': {
    ko: '환불 및 교환',
    en: 'Returns & Exchanges',
    ja: '返金・交換',
    'zh-CN': '退款与换货',
  },
  '기타 문의': { ko: '기타 문의', en: 'Other Inquiries', ja: 'その他', 'zh-CN': '其他咨询' },

  // Contact category options (Zendesk field 56709693286041)
  '계정 관련 문의': {
    ko: '계정 관련 문의',
    en: 'Account',
    ja: 'アカウント関連',
    'zh-CN': '账户相关',
  },
  '결제/환불 문의': {
    ko: '결제/환불 문의',
    en: 'Payment / Refund',
    ja: '決済・返金',
    'zh-CN': '支付/退款',
  },
  '주문 관련 문의': { ko: '주문 관련 문의', en: 'Order', ja: '注文関連', 'zh-CN': '订单相关' },
  '패키징 관련 문의': {
    ko: '패키징 관련 문의',
    en: 'Packaging',
    ja: '梱包関連',
    'zh-CN': '包装相关',
  },
  '배송 관련 문의': { ko: '배송 관련 문의', en: 'Shipping', ja: '配送関連', 'zh-CN': '配送相关' },

  // Home section headers
  '자주 묻는 질문': {
    ko: '자주 묻는 질문',
    en: 'Frequently Asked Questions',
    ja: 'よくある質問',
    'zh-CN': '常见问题',
  },
  '더 보기': { ko: '더 보기', en: 'View all', ja: 'もっと見る', 'zh-CN': '查看更多' },

  // FAQ page
  전체: { ko: '전체', en: 'All', ja: 'すべて', 'zh-CN': '全部' },

  // Contact
  '문의 제목': { ko: '문의 제목', en: 'Subject', ja: '件名', 'zh-CN': '主题' },
  '문의 내용': { ko: '문의 내용', en: 'Message', ja: '内容', 'zh-CN': '内容' },
  이름: { ko: '이름', en: 'Name', ja: 'お名前', 'zh-CN': '姓名' },
  이메일: { ko: '이메일', en: 'Email', ja: 'メールアドレス', 'zh-CN': '邮箱' },
  제출하기: { ko: '제출하기', en: 'Submit', ja: '送信する', 'zh-CN': '提交' },
  '문의하기 제목': { ko: '문의하기', en: 'Contact Us', ja: 'お問い合わせ', 'zh-CN': '联系我们' },
  '문의 안내': {
    ko: '빠른 시일 내에 답변 드리겠습니다.\n이메일로 연락 주시면 더 빠른 응대가 가능합니다.',
    en: 'We will get back to you as soon as possible.\nEmail us for a faster response.',
    ja: 'できるだけ早くご返信いたします。\nメールでのお問い合わせがより迅速に対応できます。',
    'zh-CN': '我们会尽快回复您。\n通过电子邮件联系我们，可以获得更快的响应。',
  },
  // Contact form fields
  '이메일 주소': {
    ko: '이메일 주소',
    en: 'Email Address',
    ja: 'メールアドレス',
    'zh-CN': '邮箱地址',
  },
  '이메일 주소 placeholder': {
    ko: '앨범버디 가입 계정을 적어주세요.',
    en: 'Please enter your AlbumBuddy account email.',
    ja: 'AlbumBuddyの登録アカウントを入力してください。',
    'zh-CN': '请输入您的AlbumBuddy注册账号邮箱。',
  },
  제목: { ko: '제목', en: 'Subject', ja: '件名', 'zh-CN': '主题' },
  '제목 placeholder': {
    ko: '내용을 입력해주세요',
    en: 'Enter the subject',
    ja: '件名を入力してください',
    'zh-CN': '请输入主题',
  },
  카테고리: { ko: '카테고리', en: 'Category', ja: 'カテゴリ', 'zh-CN': '类别' },
  '카테고리 선택': {
    ko: '카테고리를 선택해주세요',
    en: 'Select a category',
    ja: 'カテゴリを選択してください',
    'zh-CN': '请选择类别',
  },
  주문번호: {
    ko: '주문번호 / 송장번호 / 패키지번호',
    en: 'Order No. / Tracking No. / Package No.',
    ja: '注文番号 / 送り状番号 / パッケージ番号',
    'zh-CN': '订单号 / 运单号 / 包裹号',
  },
  '주문번호 placeholder': {
    ko: '제공 가능한 번호를 입력해주세요',
    en: 'Enter any available number',
    ja: '提供可能な番号を入力してください',
    'zh-CN': '请输入可提供的编号',
  },
  '주문번호 도움말': {
    ko: '주문번호, 송장번호, 패키지번호 중 제공 가능한 정보를 기재해주세요.',
    en: 'Please enter whichever is available: order number, tracking number, or package number.',
    ja: '注文番号・送り状番호・パッケージ番号のうち、提供可能な情報をご記入ください。',
    'zh-CN': '请填写订单号、运单号或包裹号中任一可提供的信息。',
  },
  설명: { ko: '설명', en: 'Description', ja: '説明', 'zh-CN': '描述' },
  '설명 placeholder': {
    ko: '문의 내용을 자세히 입력해 주세요.',
    en: 'Please describe your issue in detail.',
    ja: 'お問い合わせ内容を詳しくご入力ください。',
    'zh-CN': '请详细描述您的问题。',
  },
  '설명 도움말': {
    ko: '요청에 관한 세부 정보를 입력하세요. 저희 지원 스태프가 가능한 빨리 자세한 답변을 드리도록 하겠습니다.',
    en: 'Enter the details of your request. Our support staff will respond as quickly as possible.',
    ja: 'リクエストの詳細を入力してください。サポートスタッフができるだけ早くご回答いたします。',
    'zh-CN': '请输入您请求的详细信息。我们的支持团队将尽快为您回复。',
  },
  '파일 첨부': { ko: '파일 첨부', en: 'Attachments', ja: 'ファイル添付', 'zh-CN': '附件' },
  '파일 드롭': {
    ko: '이곳에 파일을 올려주세요',
    en: 'Drop files here or click to upload',
    ja: 'ここにファイルをドロップするか、クリックしてアップロード',
    'zh-CN': '拖拽文件到此处或点击上传',
  },
  '파일 크기 안내': {
    ko: '파일당 최대 50MB까지 업로드할 수 있습니다.',
    en: 'Maximum file size: 50MB per file.',
    ja: '1ファイルあたり最大50MBまでアップロードできます。',
    'zh-CN': '每个文件最大支持上传 50MB。',
  },
  '파일 용량 초과': {
    ko: '파일 용량을 확인해주세요. (최대 50MB)',
    en: 'Please check the file size. (Max 50MB)',
    ja: 'ファイルサイズをご確認ください。（最大50MB）',
    'zh-CN': '请检查文件大小。（最大50MB）',
  },
  제출: { ko: '제출', en: 'Submit', ja: '送信', 'zh-CN': '提交' },
  '접수 완료': {
    ko: '문의가 접수되었습니다',
    en: 'Request submitted successfully',
    ja: 'お問い合わせを受け付けました',
    'zh-CN': '您的请求已成功提交',
  },
  '접수 안내': {
    ko: '입력하신 이메일로 확인 메일이 발송됩니다.\n영업일 기준 1~2일 이내에 답변 드리겠습니다.',
    en: 'A confirmation email will be sent to you.\nWe will respond within 1–2 business days.',
    ja: 'ご登録のメールアドレスに確認メールをお送りします。\n1〜2営業日以内にご回答いたします。',
    'zh-CN': '确认邮件已发送至您的邮箱。\n我们将在1-2个工作日内回复您。',
  },
  '새 문의 작성': {
    ko: '새 문의 작성',
    en: 'Submit another request',
    ja: '新しいお問い合わせを送る',
    'zh-CN': '提交新请求',
  },
  '제출 오류': {
    ko: '문의 제출에 실패했습니다. 다시 시도해 주세요.',
    en: 'Failed to submit. Please try again.',
    ja: '送信に失敗しました。もう一度お試しください。',
    'zh-CN': '提交失败，请重试。',
  },

  // Home page - Hero
  'hero-subtitle': {
    ko: '믿을 수 있는 구매대행, K-굿즈 쇼핑을 쉽고 빠르게!',
    en: 'Your trusted way to shop Korean goods.',
    ja: '信頼できる代行購入でK-POP商品をかんたんに！',
    'zh-CN': '值得信赖的代购，轻松购买K-pop周边！',
  },

  // Home page - Stats
  '홈 섹션1 제목': {
    ko: '1시간 걸리던 구매대행,\n5분 컷으로 끝내기',
    en: 'Proxy buying in minutes.\nNot an hour.',
    ja: '1時間かかった代行購入を、\n5分で終わらせよう',
    'zh-CN': '代购不再耗费一小时，\n5分钟轻松搞定',
  },
  // FAQ 카테고리 공통
  All: { ko: '전체', en: 'All', ja: 'すべて', 'zh-CN': '全部' },

  // FAQ 카테고리 — Notion select 값 (기존 키와 다른 것만)
  '결제/환불 관련 문의': {
    ko: '결제/환불 관련 문의',
    en: 'Payment & Refund',
    ja: 'お支払い・返金',
    'zh-CN': '付款与退款',
  },
  '패키징 관련 모든 문의': {
    ko: '패키징 관련 모든 문의',
    en: 'Packaging',
    ja: 'パッケージング',
    'zh-CN': '包装问题',
  },
  '기타 문의사항': { ko: '기타 문의사항', en: 'Other', ja: 'その他', 'zh-CN': '其他问题' },

  'stat-suffix-개+': { ko: '개+', en: '+', ja: '+', 'zh-CN': '+' },
  'stat-suffix-시간': { ko: '시간', en: ' hr', ja: '時間', 'zh-CN': '小时' },
  'stat-suffix-분이내': { ko: '분이내', en: ' min', ja: '分以内', 'zh-CN': '分钟内' },

  판매처: { ko: '판매처', en: 'Sellers', ja: '販売店', 'zh-CN': '卖家数' },
  '등록 상품 수': {
    ko: '등록 상품 수',
    en: 'Listed products',
    ja: '登録商品数',
    'zh-CN': '商品数量',
  },
  '업데이트 주기': {
    ko: '업데이트 주기',
    en: 'Update frequency',
    ja: '更新頻度',
    'zh-CN': '更新频率',
  },
  '상품 직접 등록': {
    ko: '상품 직접 등록',
    en: 'Self-registration',
    ja: '直接登録',
    'zh-CN': '自助上架',
  },

  // Home page - Features
  '홈 섹션2 제목': {
    ko: '일반 쇼핑처럼 즐기고,\n내가 산 물품과 같이 패키징 하자',
    en: 'Shop freely.\nPackage everything together.',
    ja: '普通のショッピングのように楽しみながら、\n購入した商品を一緒にパッケージしよう',
    'zh-CN': '像平时购物一样轻松，\n将所有商品一起打包',
  },

  // Proxy buying - desktop steps
  '구매대행 이용법': {
    ko: '구매대행 이용법',
    en: 'How to Use Proxy Buying',
    ja: '代行購入の利用方法',
    'zh-CN': '如何使用代购',
  },
  '구매대행 step1': {
    ko: '원하는 아티스트나 앨범을 검색해 보세요.',
    en: 'Search for your favorite artist or album.',
    ja: 'お気に入りのアーティストやアルバムを検索してみましょう。',
    'zh-CN': '搜索您喜欢的艺人或专辑。',
  },
  '구매대행 step2': {
    ko: '여기저기 옮겨 다닐 필요 없어요.\n모든 스토어를 모아뒀거든요!',
    en: "No need to jump between sites.\nWe've gathered all stores in one place!",
    ja: 'あちこち移動する必要はありません。\nすべてのストアをまとめています！',
    'zh-CN': '无需在不同网站间跳转，\n我们汇集了所有商店！',
  },
  '구매대행 step3': {
    ko: '단 몇 초만에 원하는 상품을 담아서 구매해보세요.',
    en: 'Add items to your cart and purchase in seconds.',
    ja: '数秒で欲しい商品をカートに入れて購入できます。',
    'zh-CN': '几秒内将商品加入购物车并完成购买。',
  },
  '구매대행 step4': {
    ko: '해외 카드/결제 수단으로 대량 구매도,\n팬 사인회 응모도 정말 쉬워져요.',
    en: 'Bulk purchases with international payment methods\nand fan sign entries made easy.',
    ja: '海外カード/決済での大量購入も、\nファンサイン会の応募も本当に簡単になります。',
    'zh-CN': '用境外支付方式批量购买，\n参加签名会抽签都变得超简单！',
  },
  '쇼핑하러 가기': {
    ko: '쇼핑하러 가기',
    en: 'Start shopping',
    ja: 'ショッピングへ',
    'zh-CN': '去购物',
  },

  // Proxy buying - mobile description
  '구매대행 제목 모바일': {
    ko: '구매대행은 어떻게 이용하나요?',
    en: 'How do I use the proxy buying service?',
    ja: '代行購入はどのように利用しますか？',
    'zh-CN': '如何使用代购服务？',
  },
  '구매대행 설명 모바일': {
    ko: '원하는 아티스트나 앨범을 검색 후 판매처를 확인해보세요.\n단 몇 초 만에 원하는 상품을 담아 확인할 수 있어요.\n해외 카드/결제 수단으로 대량 구매도, 이벤트 응모도 정말 쉬워져요.',
    en: 'Search for your artist or album and check available sellers.\nAdd items to your cart in seconds.\nBulk purchases and event entries with international payment are easy.',
    ja: 'アーティストやアルバムを検索して販売店を確認してください。\n数秒で商品をカートに入れることができます。\n海外決済での大量購入やイベント応募も簡単です。',
    'zh-CN':
      '搜索艺人或专辑并查看卖家。\n几秒内将商品加入购物车。\n用境外支付批量购买或参与活动都很容易。',
  },

  // Shipping forwarding - desktop steps
  '배송대행 이용법': {
    ko: '배송대행 이용법',
    en: 'How to Use Shipping Forwarding',
    ja: '配送代行の利用方法',
    'zh-CN': '如何使用转运',
  },
  '배송대행 step1': {
    ko: '마이페이지 > My K-address🇰🇷 메뉴에서\n물류센터 주소를 확인하실 수 있어요!',
    en: 'Check your logistics center address\nat My Page > My K-address🇰🇷!',
    ja: 'マイページ > My K-address🇰🇷で\n物流センターの住所を確認できます！',
    'zh-CN': '在"我的主页 > My K-address🇰🇷"\n查看物流中心地址！',
  },
  '배송대행 step2': {
    ko: '쇼핑하신 물품을 My K-address로 보내고,\n센터에 도착할 때까지 기다려 주세요!',
    en: 'Send your purchases to My K-address\nand wait for them to arrive!',
    ja: '購入した商品をMy K-addressに送り、\nセンターに届くまでお待ちください！',
    'zh-CN': '将购买的商品寄往My K-address，\n等待货物到达仓库！',
  },
  '배송대행 step3': {
    ko: 'My packages > Warehouse에서\n도착한 물품을 확인해주세요.',
    en: 'Check your arrived items at\nMy packages > Warehouse.',
    ja: 'My packages > Warehouseで\n到착した商品を確認してください。',
    'zh-CN': '在"My packages > Warehouse"\n查看已到达的商品。',
  },
  '배송대행 step4': {
    ko: '보관 중인 물품을 해외로 배송받으시려면,\n상세 물품 정보를 입력해주세요!',
    en: 'To ship stored items overseas,\nplease fill in the item details!',
    ja: '保管中の商品を海外に配送するには、\n詳細な商品情報を入力してください！',
    'zh-CN': '如需将存放的商品发往海外，\n请填写详细的商品信息！',
  },
  '확인하러 가기': {
    ko: '확인하러 가기',
    en: 'Check now',
    ja: '確認しに行く',
    'zh-CN': '立即查看',
  },

  // Shipping forwarding - mobile description
  '배송대행 제목 모바일': {
    ko: '배송대행은 어떻게 이용하나요?',
    en: 'How do I use the shipping forwarding service?',
    ja: '配送代行はどのように利用しますか？',
    'zh-CN': '如何使用转运服务？',
  },
  '배송대행 설명 모바일': {
    ko: '마이페이지 > My K-address에서 물류센터 주소를 확인해보세요. 구매한 물품을 물류센터로 보내고, 센터에 도착한 후 상세 물품 정보를 입력해주세요.\n이후 해외 배송을 위해 패키징 선택이 가능합니다!',
    en: 'Check your logistics center address at My Page > My K-address. Send items to the center and fill in item details after they arrive.\nYou can then choose packaging for international shipping!',
    ja: 'マイページ > My K-addressで物流センターの住所を確認してください。商品をセンターに送り、到着後に詳細を入力してください。\nその後、海外配送のパッケージングを選択できます！',
    'zh-CN':
      '在"我的主页 > My K-address"查看物流中心地址。将商品寄往仓库，到达后填写详细信息。\n之后可以选择打包方式进行海外配送！',
  },

  // FAQ home
  '더 보러 가기': {
    ko: '더 보러 가기',
    en: 'View all FAQs',
    ja: 'もっと見る',
    'zh-CN': '查看全部',
  },

  // CTA
  '홈 CTA 문구': {
    ko: '일반 쇼핑처럼 간편하게!\n한국 현지에서 쇼핑하는\n즐거움을 그대로 느껴보세요',
    en: 'Shop effortlessly.\nExperience the joy\nof shopping from Korea!',
    ja: '普通のショッピングのように気軽に！\n韓国現地でショッピングする\n楽しさをそのまま体験しましょう',
    'zh-CN': '像平时购物一样轻松！\n感受直接在韩国本地购物\n的乐趣！',
  },

  // Notices
  '목록으로 돌아가기': {
    ko: '목록으로 돌아가기',
    en: 'Back to list',
    ja: '一覧に戻る',
    'zh-CN': '返回列表',
  },

  // Footer
  '개인정보 처리방침': {
    ko: '개인정보 처리방침',
    en: 'Privacy Policy',
    ja: 'プライバシーポリシー',
    'zh-CN': '隐私政策',
  },
  이용약관: { ko: '이용약관', en: 'Terms of Service', ja: '利用規約', 'zh-CN': '服务条款' },

  // Notice categories
  '일반 공지': { ko: '일반 공지', en: 'General', ja: 'お知らせ', 'zh-CN': '一般公告' },
  약관: { ko: '약관', en: 'Terms', ja: '約款', 'zh-CN': '条款' },
  '이용 가이드': { ko: '이용 가이드', en: 'Guide', ja: 'ご利用ガイド', 'zh-CN': '使用指南' },
  '이벤트 관련 공지': { ko: '이벤트 관련 공지', en: 'Events', ja: 'イベント', 'zh-CN': '活动公告' },
  '휴일 관련 공지': { ko: '휴일 관련 공지', en: 'Holidays', ja: '休日のお知らせ', 'zh-CN': '假日公告' },
  '긴급 공지': { ko: '긴급 공지', en: 'Urgent', ja: '緊急のお知らせ', 'zh-CN': '紧急公告' },
  'footer-desc': {
    ko: 'AlbumBuddy는 해외에서 K-pop 앨범, 굿즈 등을 쉽고 편리하게\n구매하고 받을 수 있도록 도와주는 구매대행 및 배송대행 서비스입니다.',
    en: 'AlbumBuddy is a proxy buying and shipping service that helps you easily buy\nand receive K-pop albums, merch, and more from overseas for your convenience.',
    ja: 'AlbumBuddyは、海外からK-popアルバムやグッズなどを簡単かつ便利に\n購入・受け取りできる代行購入・配送サービスです。',
    'zh-CN': 'AlbumBuddy是一项代购和转运服务，\n帮助您轻松便捷地从海外购买和接收K-pop专辑、周边商品等。',
  },
};

export function t(key: string): string {
  const entry = translations[key];
  if (!entry) {
    if (import.meta.dev) {
      console.warn(`[i18n] 미번역 키: "${key}" — i18n.ts에 번역을 추가하세요.`);
    }
    return key;
  }
  return entry[currentLang.value] || entry.ko || key;
}

export function setLang(lang: Lang) {
  currentLang.value = lang;
}
