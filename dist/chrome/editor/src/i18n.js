// Translations. Every key maps to [en, ru, fa, zh]. Product names are not translated.
export const LANGS = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'fa', name: 'فارسی', dir: 'rtl' },
  { code: 'zh', name: '中文', dir: 'ltr' },
];
const INDEX = { en: 0, ru: 1, fa: 2, zh: 3 };

export const DICT = {
  'app.name': ['ImagePad', 'ImagePad', 'ImagePad', 'ImagePad'],
  'app.tagline': ['Prepare images for upload. Everything stays on your device.', 'Подготовка изображений перед загрузкой. Всё остаётся на вашем устройстве.', 'آماده‌سازی تصویر برای آپلود. همه‌چیز روی دستگاه خودتان می‌ماند.', '上传前处理图片。所有内容都留在您的设备上。'],
  'drop.title': ['Drop an image here', 'Перетащите изображение сюда', 'تصویر را اینجا رها کنید', '将图片拖到这里'],
  'drop.hint': ['or paste with Ctrl+V, or right-click an image on a page and choose Edit', 'или вставьте через Ctrl+V, либо щёлкните картинку на странице правой кнопкой и выберите «Редактировать»', 'یا با Ctrl+V بچسبانید، یا روی تصویر یک صفحه راست‌کلیک و «ویرایش» را بزنید', '或按 Ctrl+V 粘贴，或在网页图片上右键选择“编辑”'],

  'btn.open': ['Open', 'Открыть', 'باز کردن', '打开'],
  'btn.undo': ['Undo', 'Отменить', 'واگرد', '撤销'],
  'btn.redo': ['Redo', 'Повторить', 'وا‌رفت', '重做'],
  'btn.zoom': ['Zoom', 'Масштаб', 'بزرگ‌نمایی', '放大'],
  'more.title': ['Edits, output and watermark', 'Правки, вывод и водяной знак', 'ویرایش‌ها، خروجی و واترمارک', '编辑、输出与水印'],
  'help.zoomdlg': ['Open the image larger to check details', 'Открыть изображение крупнее для проверки деталей', 'تصویر را بزرگ‌تر باز کنید تا جزئیات را ببینید', '放大查看细节'],
  'btn.drag': ['Drag', 'Перетащить', 'کشیدن', '拖动'],
  'drag.ready': ['Drag this onto the page', 'Перетащите на страницу', 'روی صفحه بکشید', '拖到页面上'],
  'drag.wait': ['Preparing the file…', 'Файл готовится…', 'فایل در حال آماده‌سازی است…', '正在准备文件…'],
  'toast.preparing': ['Still preparing the file, try again in a moment', 'Файл ещё готовится, попробуйте через секунду', 'فایل هنوز آماده نشده، کمی بعد دوباره امتحان کنید', '文件仍在准备中，请稍后再试'],
  'toast.denied': ['Access to the page was not allowed. Use Drag, Copy or Save instead.', 'Доступ к странице не разрешён. Используйте перетаскивание, копирование или сохранение.', 'دسترسی به صفحه داده نشد. از کشیدن، کپی یا ذخیره استفاده کنید.', '未允许访问页面。请改用拖动、复制或保存。'],
  'toast.blocked': ['Chrome does not allow changes on this page. Use Drag, Copy or Save.', 'Chrome не разрешает изменения на этой странице. Используйте перетаскивание, копирование или сохранение.', 'کروم اجازه‌ی تغییر در این صفحه را نمی‌دهد. از کشیدن، کپی یا ذخیره استفاده کنید.', 'Chrome 不允许修改此页面。请使用拖动、复制或保存。'],
  'toast.nofile': ['This page has no file field. Drag the image onto the page instead.', 'На этой странице нет поля файла. Перетащите изображение на страницу.', 'این صفحه فیلد فایل ندارد. تصویر را روی صفحه بکشید.', '此页面没有文件框。请把图片拖到页面上。'],
  'menu.settings': ['Settings', 'Настройки', 'تنظیمات', '设置'],
  'menu.about': ['About', 'О проекте', 'درباره', '关于'],
  'about.what': ['ImagePad prepares images right beside the page you are working on. Crop to a free area or to a common site frame, blur, pixelate or cover parts of a picture, add a watermark, then drag the result into the page, copy it or save it. Everything runs on your device.', 'ImagePad готовит изображения прямо рядом с нужной страницей. Обрежьте кадр свободно или по размеру сайта, размойте, пикселизируйте или закройте части изображения, добавьте водяной знак, затем перетащите результат на страницу, скопируйте или сохраните. Всё работает на вашем устройстве.', 'ImagePad تصویر را درست کنار صفحه‌ای که روی آن کار می‌کنید آماده می‌کند. برش آزاد یا با اندازه‌ی سایت، محو و پیکسلی کردن یا پوشاندن بخشی از تصویر، افزودن واترمارک، و بعد کشیدن نتیجه به صفحه، کپی یا ذخیره. همه‌چیز روی دستگاه شما اجرا می‌شود.', 'ImagePad 在您正在操作的网页旁边准备图片。可自由裁剪或按网站尺寸裁剪，模糊、像素化或遮盖部分图片，添加水印，然后将结果拖到页面、复制或保存。全部在您的设备上运行。'],
  'about.wudp': ['WUDp is a set of small helper tools for the web, made by TGO.', 'WUDp — набор небольших вспомогательных инструментов для веба от TGO.', 'WUDp مجموعه‌ای از ابزارهای کمکی کوچک برای وب است که توسط TGO ساخته شده.', 'WUDp 是 TGO 开发的一套小型网页辅助工具。'],
  'about.repo': ['The repository link will be published after the first release.', 'Ссылка на репозиторий появится после первого релиза.', 'لینک مخزن پس از اولین انتشار اعلام می‌شود.', '仓库链接将在首次发布后公布。'],
  'about.gh': ['TGO on GitHub', 'TGO на GitHub', 'TGO در GitHub', 'TGO 的 GitHub'],
  'about.org': ['WUDp organization', 'Организация WUDp', 'سازمان WUDp', 'WUDp 组织'],
  'phase.edit': ['Edit', 'Правка', 'ویرایش', '编辑'],
  'phase.out': ['Finish', 'Готово', 'خروجی', '输出'],
  'btn.zoomin': ['Zoom in', 'Увеличить', 'بزرگ‌تر', '放大'],
  'btn.zoomout': ['Zoom out', 'Уменьшить', 'کوچک‌تر', '缩小'],
  'edit.count': ['Edits: {n}', 'Правки: {n}', 'ویرایش‌ها: {n}', '编辑：{n}'],
  'finish.hint': ['Drag the image onto a page, or use Copy or Save below.', 'Перетащите изображение на страницу или используйте Копировать или Сохранить ниже.', 'تصویر را روی صفحه بکشید، یا از کپی و ذخیره‌ی پایین استفاده کنید.', '将图片拖到页面上，或使用下方的复制或保存。'],
  'help.history': ['Show or hide the list of edits', 'Показать или скрыть список правок', 'نمایش یا پنهان کردن فهرست ویرایش‌ها', '显示或隐藏编辑列表'],
  'tour.next': ['Next', 'Далее', 'بعدی', '下一步'],
  'tour.back': ['Back', 'Назад', 'قبلی', '上一步'],
  'tour.skip': ['Skip', 'Пропустить', 'رد کردن', '跳过'],
  'tour.done': ['Done', 'Готово', 'تمام', '完成'],
  'tour.s1.t': ['Open an image', 'Откройте изображение', 'یک تصویر باز کنید', '打开图片'],
  'tour.s1.b': ['Open a photo, drop one here, paste with Ctrl+V, or right-click an image on a page and choose Edit.', 'Откройте фото, перетащите его сюда, вставьте через Ctrl+V или щёлкните картинку на странице правой кнопкой и выберите «Редактировать».', 'یک عکس باز کنید، روی این صفحه بکشید، با Ctrl+V بچسبانید، یا روی تصویر یک صفحه راست\u200cکلیک و «ویرایش» را بزنید.', '打开照片、拖到这里、按 Ctrl+V 粘贴，或在网页图片上右键选择“编辑”。'],
  'tour.s2.t': ['Your image', 'Ваше изображение', 'تصویر شما', '您的图片'],
  'tour.s2.b': ['Mouse wheel zooms. Hold Space and drag to move the view. Original, Edited and Output switch what you see.', 'Колесо мыши — масштаб. Удерживайте Пробел и тяните, чтобы сдвинуть вид. Оригинал, Правки и Результат переключают вид.', 'چرخ موس زوم می\u200cکند. Space را نگه دارید و بکشید تا نما جابه\u200cجا شود. اصلی، ویرایش\u200cشده و خروجی نما را عوض می\u200cکنند.', '滚轮缩放。按住空格拖动可移动视图。原图、编辑和输出可切换视图。'],
  'tour.s3.t': ['Zoom and views', 'Масштаб и виды', 'زوم و نماها', '缩放与视图'],
  'tour.s3.b': ['− and + zoom. Fit shows the whole image, 1:1 shows real pixels, and the magnifier opens a larger view.', '− и + меняют масштаб. По окну показывает всё изображение, 1:1 — реальные пиксели, лупа открывает крупный просмотр.', '− و + زوم می\u200cکنند. اندازه\u200cی پنجره کل تصویر را نشان می\u200cدهد، ۱:۱ پیکسل\u200cهای واقعی را، و ذره\u200cبین نمای بزرگ\u200cتر را باز می\u200cکند.', '− 和 + 缩放。适应窗口显示整张图，1:1 显示真实像素，放大镜打开大图查看。'],
  'tour.s4.t': ['Edit tools', 'Инструменты правки', 'ابزارهای ویرایش', '编辑工具'],
  'tour.s4.b': ['Area blurs, pixelates or covers a rectangle or ellipse. Brush paints the same effects. Crop cuts out a part. Move pans the view.', 'Область размывает, пикселизирует или закрывает прямоугольник или эллипс. Кисть рисует теми же эффектами. Кадр вырезает часть. Сдвиг перемещает вид.', 'ناحیه مستطیل یا بیضی را محو، پیکسلی یا پوشانده می\u200cکند. قلم\u200cمو همین جلوه\u200cها را می\u200cکشد. برش بخشی را جدا می\u200cکند. جابه\u200cجایی نما را حرکت می\u200cدهد.', '区域可模糊、像素化或遮盖矩形或椭圆。画笔用相同效果涂抹。裁剪截取一部分。移动用于平移视图。'],
  'tour.s5.t': ['Crop', 'Кадрирование', 'برش', '裁剪'],
  'tour.s5.b': ['Free draws any rectangle. A site frame stays still while you move the image under it. Apply crop to keep the choice.', 'Свободно — любой прямоугольник. Рамка сайта неподвижна, а изображение двигается под ней. «Применить кадр» сохраняет выбор.', 'آزاد: هر مستطیلی. قاب سایت ثابت می\u200cماند و شما عکس را زیر آن جابه\u200cجا می\u200cکنید. «اعمال برش» انتخاب را نگه می\u200cدارد.', '自由：拖出任意矩形。网站取景框保持不动，您在框下移动图片。点击“应用裁剪”保留选择。'],
  'tour.s6.t': ['Edit history', 'История правок', 'تاریخچه\u200cی ویرایش', '编辑记录'],
  'tour.s6.b': ['Tap Edits to see every change. Undo and redo are in the top bar. The list stays folded to save space.', 'Нажмите «Правки», чтобы увидеть все изменения. Отмена и повтор — в верхней панели. Список свёрнут, чтобы не занимать место.', 'برای دیدن همه\u200cی تغییرات روی «ویرایش\u200cها» بزنید. واگرد و وا\u200cرفت در نوار بالا هستند. فهرست برای صرفه\u200cجویی در فضا جمع است.', '点击“编辑”查看所有更改。撤销和重做在顶部栏。列表默认折叠以节省空间。'],
  'tour.s7.t': ['Finish', 'Готово', 'خروجی', '输出'],
  'tour.s7.b': ['When the edits are done, open Finish to add a watermark and choose the file format, quality and size.', 'Когда правки готовы, откройте «Готово», чтобы добавить водяной знак и выбрать формат, качество и размер.', 'وقتی ویرایش تمام شد، «خروجی» را باز کنید تا واترمارک بگذارید و فرمت، کیفیت و اندازه را انتخاب کنید.', '编辑完成后，打开“输出”添加水印，并选择格式、质量和尺寸。'],
  'tour.s8.t': ['Drag, copy or save', 'Перетащите, скопируйте или сохраните', 'بکشید، کپی یا ذخیره کنید', '拖动、复制或保存'],
  'tour.s8.b': ['Hover the image to see the hint, then drag it straight into a page. Copy puts it on the clipboard and Save downloads it.', 'Наведите на изображение, чтобы увидеть подсказку, и перетащите его прямо на страницу. «Копировать» кладёт в буфер, «Сохранить» скачивает.', 'روی تصویر نگه دارید تا راهنما را ببینید، سپس مستقیم به صفحه بکشید. «کپی» در کلیپ\u200cبورد می\u200cگذارد و «ذخیره» دانلود می\u200cکند.', '将鼠标悬停在图片上查看提示，然后直接拖到页面。“复制”放入剪贴板，“保存”下载文件。'],
  'tour.s9.t': ['Settings and privacy', 'Настройки и приватность', 'تنظیمات و حریم خصوصی', '设置与隐私'],
  'tour.s9.b': ['Language, theme, start options, privacy and this tour live in this menu. Nothing leaves your device.', 'Язык, тема, параметры запуска, приватность и этот тур — в этом меню. Ничего не покидает ваше устройство.', 'زبان، تم، گزینه\u200cهای شروع، حریم خصوصی و این راهنما اینجا هستند. هیچ\u200cچیز دستگاه شما را ترک نمی\u200cکند.', '语言、主题、启动选项、隐私和本教程都在此菜单中。任何内容都不会离开您的设备。'],
  'welcome.title': ['Welcome to ImagePad', 'Добро пожаловать в ImagePad', 'به ImagePad خوش آمدید', '欢迎使用 ImagePad'],
  'welcome.body': ['Prepare images for upload right beside the page you are on. Everything stays on your device. Take a short tour?', 'Готовьте изображения для загрузки прямо рядом с нужной страницей. Всё остаётся на вашем устройстве. Пройти короткий тур?', 'تصاویر را برای آپلود درست کنار صفحه\u200cی فعلی آماده کنید. همه\u200cچیز روی دستگاه شما می\u200cماند. یک راهنمای کوتاه می\u200cخواهید؟', '在当前网页旁边准备上传用的图片。一切都留在您的设备上。要看一段简短教程吗？'],
  'welcome.start': ['Start the tour', 'Начать тур', 'شروع راهنما', '开始教程'],
  'welcome.later': ['Later', 'Позже', 'بعداً', '稍后'],
  'settings.workflow': ['Workflow', 'Работа', 'گردش کار', '工作流程'],
  'settings.starttool': ['Start with tool', 'Стартовый инструмент', 'ابزار شروع', '启动工具'],
  'settings.startview': ['Start view', 'Стартовый вид', 'نمای شروع', '启动视图'],
  'settings.interface': ['Interface', 'Интерфейс', 'رابط کاربری', '界面'],
  'settings.hints': ['Show hints', 'Показывать подсказки', 'نمایش راهنماها', '显示提示'],
  'settings.largeui': ['Larger controls', 'Крупные элементы', 'کنترل\u200cهای بزرگ\u200cتر', '更大的控件'],
  'settings.reducemotion': ['Reduce motion', 'Меньше анимации', 'کاهش انیمیشن', '减少动画'],
  'settings.tour': ['Guided tour', 'Обучение', 'راهنمای آموزشی', '教程'],
  'settings.privacy.title': ['Privacy', 'Приватность', 'حریم خصوصی', '隐私'],
  'priv.1': ['Nothing leaves your device. Images are processed in the browser and are never uploaded.', 'Ничего не покидает ваше устройство. Изображения обрабатываются в браузере и никогда не загружаются.', 'هیچ\u200cچیز دستگاه شما را ترک نمی\u200cکند. تصاویر در مرورگر پردازش می\u200cشوند و هرگز آپلود نمی\u200cشوند.', '任何内容都不会离开您的设备。图片在浏览器中处理，从不上传。'],
  'priv.2': ['Images stay in memory while the panel is open. They are not saved between sessions.', 'Изображения хранятся в памяти, пока открыта панель. Между сеансами они не сохраняются.', 'تصاویر فقط تا وقتی پنل باز است در حافظه می\u200cمانند و بین بازکردن\u200cها ذخیره نمی\u200cشوند.', '图片仅在面板打开时保存在内存中，不会在会话之间保存。'],
  'priv.3': ['Stored on this device: your tool and output settings, theme, language and tour progress. Nothing is sent anywhere.', 'Сохраняется на этом устройстве: настройки инструментов и вывода, тема, язык и прогресс тура. Никуда ничего не отправляется.', 'روی همین دستگاه ذخیره می\u200cشود: تنظیمات ابزار و خروجی، تم، زبان و پیشرفت راهنما. هیچ\u200cچیز جایی فرستاده نمی\u200cشود.', '保存在本设备上：工具与输出设置、主题、语言和教程进度。不会发送到任何地方。'],
  'priv.4': ['Metadata (camera, date and GPS location) is removed by default. Keeping it can reveal where a photo was taken, so keep it only when you need it.', 'Метаданные (камера, дата и координаты GPS) по умолчанию удаляются. Их сохранение может раскрыть, где сделано фото, поэтому сохраняйте только при необходимости.', 'متادیتا (دوربین، تاریخ و موقعیت GPS) به\u200cطور پیش\u200cفرض حذف می\u200cشود. نگه داشتن آن ممکن است نشان دهد عکس کجا گرفته شده، پس فقط در صورت نیاز نگه دارید.', '元数据（相机、日期和 GPS 位置）默认会被删除。保留它可能暴露拍摄地点，只在需要时保留。'],
  'priv.5': ['Permissions: the side panel (the editor), the right-click menu, and storage for your settings. The extension has no access to web pages.', 'Разрешения: боковая панель (редактор), меню правой кнопки и хранилище для настроек. Расширение не имеет доступа к веб-страницам.', 'مجوزها: پنل کناری (ویرایشگر)، منوی راست\u200cکلیک، و ذخیره\u200cسازی برای تنظیمات. افزونه به صفحات وب دسترسی ندارد.', '权限：侧边栏（编辑器）、右键菜单以及用于设置的存储。扩展无法访问网页。'],
  'meta.keep': ['Keep metadata (EXIF, GPS)', 'Сохранить метаданные (EXIF, GPS)', 'نگه داشتن متادیتا (EXIF، GPS)', '保留元数据（EXIF、GPS）'],
  'meta.keephint': ['JPEG only. Keeps camera, date and GPS. Orientation is corrected and the thumbnail is removed.', 'Только JPEG. Сохраняет камеру, дату и GPS. Ориентация исправляется, миниатюра удаляется.', 'فقط JPEG. دوربین، تاریخ و GPS را نگه می\u200cدارد. جهت تصحیح و تصویر کوچک حذف می\u200cشود.', '仅限 JPEG。保留相机、日期和 GPS。方向会被校正，缩略图会被删除。'],
  'help.tour': ['Start the guided tour', 'Запустить обучение', 'شروع راهنمای آموزشی', '启动教程'],
  'help.metakeep': ['Off removes camera, date and GPS. On keeps them (JPEG only).', 'Выкл. удаляет камеру, дату и GPS. Вкл. сохраняет их (только JPEG).', 'خاموش یعنی دوربین، تاریخ و GPS حذف شوند. روشن یعنی نگه داشته شوند (فقط JPEG).', '关闭会删除相机、日期和 GPS，开启则保留（仅 JPEG）。'],
  'btn.replaytour': ['Replay tour', 'Повторить обучение', 'تکرار راهنما', '重播教程'],
  'tour.step': ['{i} / {n}', '{i} / {n}', '{i} / {n}', '{i} / {n}'],
  'toast.demo': ['Demo image loaded. Open your own image any time.', 'Загружено демо-изображение. Откройте своё в любой момент.', 'تصویر نمونه بارگذاری شد. هر زمان خواستید تصویر خودتان را باز کنید.', '已加载示例图片。随时可以打开您自己的图片。'],
  'btn.fit': ['Fit', 'По окну', 'اندازه‌ی پنجره', '适应窗口'],
  'btn.actual': ['100%', '100%', '۱۰۰٪', '100%'],
  'btn.settings': ['Settings', 'Настройки', 'تنظیمات', '设置'],
  'btn.send': ['Send to page', 'Отправить на страницу', 'ارسال به صفحه', '发送到页面'],
  'btn.save': ['Save', 'Сохранить', 'ذخیره', '保存'],
  'btn.copy': ['Copy', 'Копировать', 'کپی', '复制'],
  'btn.applycrop': ['Apply crop', 'Применить кадр', 'اعمال برش', '应用裁剪'],
  'btn.removecrop': ['Remove crop', 'Убрать кадр', 'حذف برش', '移除裁剪'],
  'btn.clearops': ['Clear all', 'Очистить всё', 'پاک کردن همه', '全部清除'],
  'btn.close': ['Close', 'Закрыть', 'بستن', '关闭'],
  'btn.resetprefs': ['Restore default settings', 'Вернуть настройки по умолчанию', 'بازگردانی تنظیمات پیش‌فرض', '恢复默认设置'],

  'tool.select': ['Select', 'Выбор', 'انتخاب', '选择'],
  'tool.area': ['Area', 'Область', 'ناحیه', '区域'],
  'tool.brush': ['Brush', 'Кисть', 'قلم‌مو', '画笔'],
  'tool.crop': ['Crop', 'Кадр', 'برش', '裁剪'],
  'tool.hand': ['Move', 'Сдвиг', 'جابه‌جایی', '移动'],

  'hint.select': ['Click an area to select it. Delete removes it.', 'Нажмите на область, чтобы выбрать. Delete удаляет.', 'روی یک ناحیه کلیک کنید. Delete آن را حذف می‌کند.', '点击区域以选中，按 Delete 删除。'],
  'hint.area': ['Drag on the image to mark an area.', 'Перетащите по изображению, чтобы выделить область.', 'روی تصویر بکشید تا ناحیه مشخص شود.', '在图片上拖动以标记区域。'],
  'hint.brush': ['Paint over the image.', 'Рисуйте по изображению.', 'روی تصویر نقاشی کنید.', '在图片上涂抹。'],
  'hint.crop.free': ['Drag a rectangle over the image to choose the crop.', 'Перетащите прямоугольник по изображению, чтобы выбрать кадр.', 'روی تصویر یک مستطیل بکشید تا برش انتخاب شود.', '在图片上拖出矩形以选择裁剪。'],
  'hint.crop.fixed': ['Drag the image and use the wheel to zoom. The frame stays still.', 'Сдвигайте изображение и крутите колесо для зума. Рамка неподвижна.', 'تصویر را بکشید و با چرخ موس زوم کنید. قاب ثابت می‌ماند.', '拖动图片，滚轮缩放。取景框保持不动。'],
  'hint.hand': ['Drag to move the view. Wheel zooms.', 'Перетаскивание сдвигает вид. Колесо — зум.', 'بکشید تا نما جابه‌جا شود. چرخ موس زوم می‌کند.', '拖动以移动视图，滚轮缩放。'],

  'panel.area': ['Area', 'Область', 'ناحیه', '区域'],
  'panel.brush': ['Brush', 'Кисть', 'قلم‌مو', '画笔'],
  'panel.crop': ['Crop', 'Кадр', 'برش', '裁剪'],
  'panel.edits': ['Edits', 'Правки', 'ویرایش‌ها', '编辑记录'],
  'panel.output': ['Output', 'Вывод', 'خروجی', '输出'],
  'panel.watermark': ['Watermark', 'Водяной знак', 'واترمارک', '水印'],

  'field.effect': ['Effect', 'Эффект', 'جلوه', '效果'],
  'field.shape': ['Shape', 'Форма', 'شکل', '形状'],
  'field.strength': ['Strength', 'Сила', 'شدت', '强度'],
  'field.color': ['Color', 'Цвет', 'رنگ', '颜色'],
  'field.size': ['Brush size', 'Размер кисти', 'اندازه‌ی قلم‌مو', '画笔大小'],
  'field.ratio': ['Frame', 'Рамка', 'قاب', '取景框'],
  'field.custom': ['Custom size (px)', 'Свой размер (px)', 'اندازه‌ی دلخواه (px)', '自定义尺寸 (px)'],
  'field.format': ['Format', 'Формат', 'فرمت', '格式'],
  'field.quality': ['Quality', 'Качество', 'کیفیت', '质量'],
  'field.maxkb': ['Max file size (KB)', 'Макс. размер (КБ)', 'حداکثر حجم (KB)', '最大大小 (KB)'],
  'field.maxsize': ['Max size (px)', 'Макс. размер (px)', 'حداکثر اندازه (px)', '最大尺寸 (px)'],
  'field.text': ['Text', 'Текст', 'متن', '文字'],
  'field.position': ['Position', 'Положение', 'موقعیت', '位置'],
  'field.meta': ['Remove metadata (EXIF, GPS)', 'Удалить метаданные (EXIF, GPS)', 'حذف متادیتا (EXIF، GPS)', '删除元数据（EXIF、GPS）'],
  'field.metahint': ['Always on: the output is rebuilt from pixels.', 'Всегда включено: файл пересоздаётся из пикселей.', 'همیشه فعال است: خروجی از نو از پیکسل‌ها ساخته می‌شود.', '始终开启：输出由像素重新生成。'],
  'field.width': ['Width', 'Ширина', 'عرض', '宽'],
  'field.height': ['Height', 'Высота', 'ارتفاع', '高'],

  'mode.blur': ['Blur', 'Размытие', 'محو', '模糊'],
  'mode.pixelate': ['Pixelate', 'Пикселизация', 'پیکسلی', '像素化'],
  'mode.solid': ['Color cover', 'Закраска цветом', 'پوشاندن با رنگ', '纯色遮盖'],
  'shape.rect': ['Rectangle', 'Прямоугольник', 'مستطیل', '矩形'],
  'shape.ellipse': ['Ellipse', 'Эллипс', 'بیضی', '椭圆'],
  'ratio.free': ['Free (draw)', 'Свободно (рисовать)', 'آزاد (کشیدن)', '自由（绘制）'],
  'ratio.custom': ['Custom ratio', 'Своё соотношение', 'نسبت دلخواه', '自定义比例'],
  'pos.br': ['Bottom right', 'Справа снизу', 'پایین راست', '右下'],
  'pos.bl': ['Bottom left', 'Слева снизу', 'پایین چپ', '左下'],
  'pos.tr': ['Top right', 'Справа сверху', 'بالا راست', '右上'],
  'pos.tl': ['Top left', 'Слева сверху', 'بالا چپ', '左上'],
  'pos.tile': ['Full cover (tiled)', 'Полное покрытие (плиткой)', 'پوشش کامل (کاشی‌وار)', '整体平铺'],

  'view.original': ['Original', 'Оригинал', 'اصلی', '原图'],
  'view.edited': ['Edited', 'Правки', 'ویرایش‌شده', '已编辑'],
  'view.output': ['Output', 'Результат', 'خروجی', '输出'],
  'edit.none': ['No edits yet', 'Правок пока нет', 'هنوز ویرایشی نیست', '暂无编辑'],
  'edit.label': ['{n}. {what}', '{n}. {what}', '{n}. {what}', '{n}. {what}'],
  'edit.area': ['Area: {mode}', 'Область: {mode}', 'ناحیه: {mode}', '区域：{mode}'],
  'edit.brush': ['Brush: {mode}', 'Кисть: {mode}', 'قلم‌مو: {mode}', '画笔：{mode}'],

  'info.size': ['{w}×{h} · {size}', '{w}×{h} · {size}', '{w}×{h} · {size}', '{w}×{h} · {size}'],
  'info.output': ['Output {w}×{h}', 'Результат {w}×{h}', 'خروجی {w}×{h}', '输出 {w}×{h}'],
  'info.nocrop': ['No crop', 'Без кадра', 'بدون برش', '未裁剪'],
  'status.idle': ['Open an image to start', 'Откройте изображение, чтобы начать', 'برای شروع تصویری باز کنید', '打开图片开始'],
  'status.working': ['Processing on this device…', 'Обработка на этом устройстве…', 'در حال پردازش روی همین دستگاه…', '正在本机处理…'],
  'status.ready': ['Ready. Nothing has been uploaded.', 'Готово. Ничего не загружено.', 'آماده است. چیزی آپلود نشده است.', '已完成，未上传任何内容。'],
  'status.error': ['Processing failed', 'Ошибка обработки', 'پردازش ناموفق بود', '处理失败'],

  'toast.sent': ['Sent to the file field of the page', 'Отправлено в поле файла страницы', 'به فیلد فایل صفحه ارسال شد', '已发送到页面的文件框'],
  'toast.copied': ['Copied as PNG', 'Скопировано как PNG', 'به‌صورت PNG کپی شد', '已以 PNG 复制'],
  'toast.noinput': ['No file field found, image copied instead', 'Поле файла не найдено, изображение скопировано', 'فیلد فایلی پیدا نشد، تصویر کپی شد', '未找到文件框，已改为复制图片'],
  'toast.nosend': ['Open a web page first, or allow access to it', 'Сначала откройте веб-страницу или разрешите доступ к ней', 'ابتدا یک صفحه‌ی وب باز کنید یا دسترسی آن را بدهید', '请先打开网页或允许访问'],
  'toast.saved': ['Saved to downloads', 'Сохранено в загрузки', 'در پوشه‌ی دانلودها ذخیره شد', '已保存到下载'],
  'toast.error': ['Something went wrong', 'Что-то пошло не так', 'مشکلی پیش آمد', '出错了'],
  'toast.notimage': ['This file is not an image', 'Это не изображение', 'این فایل تصویر نیست', '这不是图片文件'],
  'toast.fetchfail': ['Cannot read this image from the page. Drop it here instead.', 'Не удалось прочитать изображение со страницы. Перетащите его сюда.', 'این تصویر از صفحه خوانده نشد. آن را اینجا رها کنید.', '无法读取此图片，请直接拖到这里。'],
  'toast.toobig': ['Could not reach the size limit. Try a smaller size or format.', 'Не удалось уложиться в лимит. Попробуйте меньший размер или формат.', 'به حد حجم نرسیدیم. اندازه یا فرمت دیگری امتحان کنید.', '无法达到大小限制，请尝试更小的尺寸或格式。'],
  'toast.undo': ['Undone', 'Отменено', 'واگرد شد', '已撤销'],
  'toast.redo': ['Redone', 'Повторено', 'وا‌رفت شد', '已重做'],
  'toast.settingsreset': ['Default settings restored', 'Настройки по умолчанию восстановлены', 'تنظیمات پیش‌فرض بازگردانی شد', '已恢复默认设置'],
  'toast.cropped': ['Crop applied', 'Кадр применён', 'برش اعمال شد', '裁剪已应用'],

  'settings.title': ['Settings', 'Настройки', 'تنظیمات', '设置'],
  'settings.lang': ['Language', 'Язык', 'زبان', '语言'],
  'settings.theme': ['Theme', 'Тема', 'تم', '主题'],
  'theme.modern': ['Modern', 'Современная', 'مدرن', '现代'],
  'theme.dark': ['Dark', 'Тёмная', 'تیره', '深色'],
  'theme.xp': ['Luna XP', 'Luna XP', 'Luna XP', 'Luna XP'],
  'settings.privacy': ['Settings are saved on this device only. Images are never saved.', 'Настройки сохраняются только на этом устройстве. Изображения никогда не сохраняются.', 'تنظیمات فقط روی همین دستگاه ذخیره می‌شوند. تصاویر هرگز ذخیره نمی‌شوند.', '设置仅保存在本设备上。图片从不保存。'],

  'help.drag': ['Drag the finished image onto a page', 'Перетащите готовое изображение на страницу', 'تصویر آماده را روی صفحه بکشید', '将完成的图片拖到页面上'],
  'help.menu': ['Settings and about', 'Настройки и о проекте', 'تنظیمات و درباره', '设置与关于'],
  'help.open': ['Open an image from your device', 'Открыть изображение с устройства', 'یک تصویر از دستگاهتان باز کنید', '从设备打开图片'],
  'help.undo': ['Undo the last change (Ctrl+Z)', 'Отменить последнее изменение (Ctrl+Z)', 'آخرین تغییر را برمی‌گرداند (Ctrl+Z)', '撤销上一步 (Ctrl+Z)'],
  'help.redo': ['Redo (Ctrl+Shift+Z)', 'Повторить (Ctrl+Shift+Z)', 'وا‌رفت (Ctrl+Shift+Z)', '重做 (Ctrl+Shift+Z)'],
  'help.zoom': ['Zoom. Ctrl+wheel also zooms.', 'Зум. Ctrl+колесо тоже меняет масштаб.', 'زوم. Ctrl+چرخ موس هم زوم می‌کند.', '缩放。Ctrl+滚轮也可缩放。'],
  'help.view': ['Compare the original, the edited image and the output', 'Сравните оригинал, правки и результат', 'اصل، ویرایش‌شده و خروجی را مقایسه کنید', '对比原图、编辑结果和输出'],
  'help.send': ['Put the output into the file field of the open page', 'Поместить результат в поле файла открытой страницы', 'خروجی را در فیلد فایل صفحه باز قرار می‌دهد', '将输出放入已打开页面的文件框'],
  'help.save': ['Save the output file to your computer (Ctrl+S)', 'Сохранить файл на компьютер (Ctrl+S)', 'فایل خروجی را روی کامپیوتر ذخیره می‌کند (Ctrl+S)', '将输出保存到电脑 (Ctrl+S)'],
  'help.copy': ['Copy the output as PNG', 'Копировать результат как PNG', 'خروجی را به‌صورت PNG کپی می‌کند', '将输出以 PNG 复制'],
  'help.select': ['Select areas (V)', 'Выбор областей (V)', 'انتخاب ناحیه‌ها (V)', '选择区域 (V)'],
  'help.area': ['Mark an area: blur, pixelate or cover (R)', 'Выделить область: размыть, пикселизировать или закрасить (R)', 'علامت‌گذاری ناحیه: محو، پیکسلی یا پوشاندن (R)', '标记区域：模糊、像素化或遮盖 (R)'],
  'help.brush': ['Paint with blur, pixelate or color (B)', 'Рисовать размытием, пикселизацией или цветом (B)', 'با محو، پیکسلی یا رنگ نقاشی کنید (B)', '用模糊、像素化或颜色绘制 (B)'],
  'help.crop': ['Crop: free rectangle or a fixed site size (C)', 'Кадр: свободный прямоугольник или размер сайта (C)', 'برش: مستطیل آزاد یا اندازه‌ی ثابت سایت (C)', '裁剪：自由矩形或网站固定尺寸 (C)'],
  'help.hand': ['Move the view (H, or hold Space)', 'Сдвиг вида (H или удерживайте Пробел)', 'جابه‌جایی نما (H یا نگه داشتن Space)', '移动视图（H 或按住空格）'],
  'help.mode': ['Blur smooths the area, pixelate hides details, color covers it', 'Размытие сглаживает, пикселизация скрывает детали, цвет закрывает', 'محو نرم می‌کند، پیکسلی جزئیات را پنهان می‌کند، رنگ می‌پوشاند', '模糊会柔化，像素化会隐藏细节，颜色会遮盖'],
  'help.shape': ['Shape of the next area', 'Форма следующей области', 'شکل ناحیه‌ی بعدی', '下一个区域的形状'],
  'help.strength': ['How strong the blur or the pixels are', 'Насколько сильным будет размытие или пиксель', 'قوت محو یا اندازه‌ی پیکسل‌ها', '模糊或像素的强度'],
  'help.color': ['Color for the cover or the brush', 'Цвет для закраски или кисти', 'رنگ پوشاندن یا قلم‌مو', '遮盖或画笔的颜色'],
  'help.size': ['Brush radius', 'Радиус кисти', 'شعاع قلم‌مو', '画笔半径'],
  'help.ratio': ['Free draws any rectangle. A fixed size keeps the frame still while you move the image.', 'Свободно: любой прямоугольник. Фиксированный размер: рамка неподвижна, двигайте изображение.', 'آزاد: هر مستطیلی. اندازه‌ی ثابت: قاب می‌ماند و شما عکس را جابه‌جا می‌کنید.', '自由：任意矩形。固定尺寸：取景框不动，您移动图片。'],
  'help.custom': ['Your own width and height in pixels', 'Ваши ширина и высота в пикселях', 'عرض و ارتفاع دلخواه به پیکسل', '自定义宽高（像素）'],
  'help.applycrop': ['Keep what is inside the frame', 'Оставить то, что внутри рамки', 'آنچه داخل قاب است نگه داشته می‌شود', '保留取景框内的内容'],
  'help.clearops': ['Remove all edits (not the image)', 'Удалить все правки (не изображение)', 'همه‌ی ویرایش‌ها را حذف می‌کند (نه تصویر)', '删除所有编辑（不删除图片）'],
  'help.format': ['Format of the output file', 'Формат выходного файла', 'فرمت فایل خروجی', '输出文件格式'],
  'help.quality': ['Higher is sharper and larger', 'Выше: четче и больше по размеру', 'بالاتر یعنی واضح‌تر و حجیم‌تر', '越高越清晰，文件也越大'],
  'help.maxkb': ['Lower quality until the file fits this size. 0 = no limit.', 'Снижать качество, пока файл не уложится. 0 — без ограничения.', 'کیفیت کم می‌شود تا فایل جا شود. ۰ یعنی بدون محدودیت.', '降低质量直到文件符合大小。0 表示不限。'],
  'help.maxsize': ['Scale the output down to fit. 0 = no limit.', 'Уменьшить результат до размера. 0 — без ограничения.', 'خروجی کوچک می‌شود تا جا شود. ۰ یعنی بدون محدودیت.', '将输出缩小到此尺寸。0 表示不限。'],
  'help.meta': ['Metadata is always removed in this version', 'В этой версии метаданные всегда удаляются', 'در این نسخه متادیتا همیشه حذف می‌شود', '本版本始终删除元数据'],
  'help.wm': ['Adds a text mark to the output', 'Добавляет текстовую метку к результату', 'یک متن به خروجی اضافه می‌کند', '为输出添加文字水印'],
  'help.pos': ['Where the watermark goes', 'Где будет водяной знак', 'واترمارک کجا قرار می‌گیرد', '水印位置'],
  'help.resetprefs': ['Return all tool and output settings to defaults', 'Вернуть все настройки инструментов и вывода по умолчанию', 'همه‌ی تنظیمات ابزار و خروجی را پیش‌فرض می‌کند', '将所有工具与输出设置恢复默认'],
  'help.theme': ['Change the look of the editor', 'Изменить оформление редактора', 'ظاهر ویرایشگر را تغییر می‌دهد', '更改编辑器外观'],
  'help.lang': ['Change the interface language', 'Изменить язык интерфейса', 'زبان رابط کاربری را تغییر می‌دهد', '更改界面语言'],
};

let lang = 'en';

export function detectLang() {
  const saved = localStorage.getItem('wudp-lang');
  if (saved && INDEX[saved] !== undefined) return saved;
  const nav = (navigator.language || 'en').slice(0, 2);
  return INDEX[nav] !== undefined ? nav : 'en';
}

export function t(key, vars = {}) {
  const row = DICT[key];
  if (!row) return key;
  let s = row[INDEX[lang]] ?? row[0];
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

export function setLang(code) {
  if (INDEX[code] === undefined) return;
  lang = code;
  const meta = LANGS.find((l) => l.code === code);
  document.documentElement.lang = code;
  document.documentElement.dir = meta.dir;
  localStorage.setItem('wudp-lang', code);
}

// Fills texts, aria labels, placeholders and tooltips (data-help) from the dictionary.
let hintsOn = true;
export function setHints(on) {
  hintsOn = !!on;
}

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
  root.querySelectorAll('[data-i18n-aria]').forEach((n) => n.setAttribute('aria-label', t(n.dataset.i18nAria)));
  root.querySelectorAll('[data-i18n-ph]').forEach((n) => { n.placeholder = t(n.dataset.i18nPh); });
  root.querySelectorAll('[data-help]').forEach((n) => {
    if (hintsOn) n.title = t(n.dataset.help);
    else n.removeAttribute('title');
  });
}
