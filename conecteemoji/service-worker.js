const CACHE_NAME = 'conecte-emoji-v1';
const urlsToCache = [
    './',
    './ConecteEmoji.html',
    './script.js',
    './style.css',
    './correct.mp3',
    './wrong.mp3',
    './3-estrelas.mp3',
    './4-estrelas.mp3',
    './5-estrelas.mp3',
    './videos/aviao-voou.mp4',
    './videos/bombeiro-fogo.mp4',
    './videos/cientista-microscopio.mp4',
    './videos/coelho-cenoura.mp4',
    './videos/cao-osso.mp4',
    './videos/formiga-pequena.mp4',
    './videos/elefante-grande.mp4',
	'./videos/abelha-mel.mp4',
	'./videos/aranha-teia.mp4',
	'./videos/foguete-lua.mp4',
	'./videos/gato-rato.mp4',
	'./videos/galinha-ovo.mp4',
	'./videos/macaco-banana.mp4',
	'./videos/menina-bicicleta.mp4',
	'./videos/pinguim-peixe.mp4',
	'./videos/noel-presente.mp4',
	'./videos/sono-dormir.mp4',
	'./videos/veleiro-ilha.mp4',
	'./videos/virus-doente.mp4',
	'./videos/frio-cachecol.mp4',
	'./videos/sol-oculos.mp4',
	'./videos/chuva-guarda.mp4',
    './videos/bola-basquete.mp4',
    './images/icone-192.png',
    './images/icone-512.png',
    './fonts/NotoColorEmoji.ttf'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Arquivos em cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});