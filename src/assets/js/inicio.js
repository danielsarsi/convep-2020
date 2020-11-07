const tamanho = 4 * 16;
const fatorParallax = 0.05;

const carregamento = document.getElementById("carregamento");
const numerosWrapper = document.getElementById("numeros-wrapper");
const numeros = document.getElementById("numeros");
const simbolo = document.querySelector("header img");
const texto = document.querySelector(".texto p");
const titulos = document.getElementsByClassName("titulo");
const titulo1 = titulos[1];
const titulo2 = titulos[2];
const titulo3 = titulos[2];

const evitarSobreposicao = [titulo1, titulo2, titulo3];

let items = [];
const xMax = document.documentElement.clientWidth - tamanho;
const yMax = texto.offsetTop - tamanho;
const quantidade = Math.floor((xMax * yMax) / (tamanho ^ 2) / 2000);

numerosWrapper.style.height = yMax + "px";

window.addEventListener("scroll", () => {
  numeros.style.setProperty("--y", window.scrollY * fatorParallax + "px");
});

setTimeout(() => {
  if (!simboloCarregado || !numeroCarregado) {
    carregamento.style.animationDirection = "normal";
    carregamento.style.animationPlayState = "running";
  }
}, 300);

let simboloCarregado = false;
let numeroCarregado = false;

numeroCarregar();
simboloCarregar();

function numeroCarregar() {
  let url = "assets/img/numero.png";

  if (window.devicePixelRatio >= 1.25 && window.devicePixelRatio < 2.25) {
    url = "assets/img/numero@2x.png";
  } else if (window.devicePixelRatio >= 2.25) {
    url = "assets/img/numero@3x.png";
  }

  const img = new Image();
  img.onload = () => {
    numeroCarregado = true;
    init();
  };
  img.src = url;
}

function simboloCarregar() {
  let url = "assets/img/simbolo.png";

  if (window.devicePixelRatio >= 1.25 && window.devicePixelRatio < 2.25) {
    url = "assets/img/simbolo@2x.png";
  } else if (window.devicePixelRatio >= 2.25) {
    url = "assets/img/simbolo@3x.png";
  }

  const img = new Image();
  img.onload = () => {
    simboloCarregado = true;
    init();
  };
  img.src = url;
}

function init() {
  if (simboloCarregado && numeroCarregado) {
    for (let i = 0; i < quantidade; i++) {
      criarNumero();
    }

    if (carregamento.style.animationDirection === "normal") {
      carregamento.style.animationDirection = "reverse";
      carregamento.style.animationPlayState = "running";
    }

    simbolo.style.animationPlayState = "running";
  }
}

function sobreposto(x, y) {
  for (const el of evitarSobreposicao) {
    const xMin = el.offsetLeft;
    const xMax = xMin + el.clientWidth;
    const yMin = el.offsetTop;
    const yMax = yMin + el.clientHeight;

    if (x > xMin - tamanho && x < xMax && y > yMin - tamanho && y < yMax) {
      return true;
    }
  }

  for (const i of items) {
    const xMin = i.x;
    const xMax = xMin + tamanho;
    const yMin = i.y;
    const yMax = yMin + tamanho;

    if (x > xMin - tamanho && x < xMax && y > yMin - tamanho && y < yMax) {
      return true;
    }
  }

  return false;
}

function criarNumero() {
  const x = Math.floor(Math.random() * xMax);
  const y = Math.floor(Math.random() * yMax);
  const inercia = Math.floor(Math.random() * 16 * 5) + 16 * 4;

  if (sobreposto(x, y)) {
    criarNumero();
    return;
  }

  const n = document.createElement("div");
  n.className = "numero";
  n.style.setProperty("--inercia", -inercia + "px");
  n.style.setProperty("--x", x + "px");
  n.style.setProperty("--y", y + "px");
  numeros.append(n);

  items = [...items, { x, y }];
}
