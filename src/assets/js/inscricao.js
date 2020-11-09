function inscricao() {
  return {
    data: {
      activities: [],
    },
    carregando: false,
    formulario: {
      nome: "",
      email: "",
      nascimento: "",
      estado: "",
      cidade: "",
      libras: false,
      atividades: [],
    },
    erros: {
      nome: "",
      email: "",
      nascimento: "",
      cidade: "",
    },
    tocado: {
      nome: false,
      email: false,
      nascimento: false,
      cidade: false,
    },
    tocar(f) {
      this.tocado[f] = true;
      this.validar(f);
    },
    mudarEstado() {
      if (this.formulario.estado === "DF") {
        this.formulario.cidade = "Brasília";
      } else {
        this.formulario.cidade = "";
      }

      this.validar("cidade");
    },
    processarOficinas(e) {
      const oficinaSelecionada = this.data.activities.find(
        (v) => v.id === +e.target.value
      );

      const outrasOficinas = this.data.activities.filter((v) => {
        return (
          !this.formulario.atividades.includes("" + v.id) &&
          v.id !== +e.target.value
        );
      });

      for (const episodio of oficinaSelecionada.episodes) {
        const start = new Date(episodio.start);
        const end = new Date(episodio.end);

        for (const outraOficina of outrasOficinas) {
          for (const outroEpisodio of outraOficina.episodes) {
            const outroStart = new Date(outroEpisodio.start);
            const outroEnd = new Date(outroEpisodio.end);

            const comparacao = start < outroEnd && outroStart < end;

            if (comparacao) {
              outraOficina._conflito = e.target.checked;
              break;
            }
          }
        }
      }
    },
    validar(f) {
      const valor = this.formulario[f];
      const erros = this.erros;

      switch (f) {
        case "nome":
          if (!valor) {
            erros[f] = "O nome é obrigatório.";
          } else {
            erros[f] = "";
          }
          break;
        case "cidade":
          if (this.formulario.estado && !valor) {
            erros[f] = "A cidade é obrigatória.";
          } else {
            erros[f] = "";
          }
          break;
        case "email": {
          const regex = new RegExp("^\\S+@\\S+[\\.][0-9a-z]+$");

          if (!valor) {
            erros[f] = "O e-mail é obrigatório.";
          } else if (!regex.test(valor)) {
            erros[f] = "O e-mail precisa ser válido.";
          } else {
            erros[f] = "";
          }
          break;
        }
        case "nascimento": {
          const regex = /(0[1-9]|1[0-9]|2[0-9]|3[0-1])[/](0[1-9]|1[0-2])[/](19[0-8][0-9]|199[0-9]|200[0-9]|201[0-9])/;

          if (valor && !regex.test(valor)) {
            erros[f] = "O data precisa ser válida.";
          } else {
            erros[f] = "";
          }

          break;
        }
        default:
          erros[f] = "";
          break;
      }
    },
    async init() {
      const activities = await fetch(
        "https://capsideo.convep.org/activities/enrollment"
      );

      this.data.activities = await activities.json();
    },
    async enviar() {
      for (const f of Object.keys(this.tocado)) {
        this.validar(f);
        this.tocado[f] = true;
      }

      for (const [_, e] of Object.entries(this.erros)) {
        if (e) {
          this.erro =
            "Houve erros de validação. Verifique se inseriu os dados corretamente.";
          return;
        }
      }

      this.erro = "";
      this.carregando = true;

      const request = {
        email: this.formulario.email,
        name: this.formulario.nome,
        birth: null,
        state: this.formulario.estado || null,
        city: this.formulario.cidade || null,
        libras: this.formulario.libras,
        activities: null,
      };

      if (this.formulario.nascimento) {
        const nascimento = this.formulario.nascimento.split("/");
        request.birth = new Date(nascimento[2], nascimento[1], nascimento[0]);
      }

      if (this.formulario.atividades.length) {
        request.activities = this.formulario.atividades.map((a) => +a);
      }

      const result = await fetch("https://capsideo.convep.org/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const response = await result.json();

      if (result.status !== 201) {
        this.carregando = false;

        switch (response.code) {
          case 2:
            this.erro =
              "Houve erros de validação. Verifique se inseriu os dados corretamente.";
            break;
          case 5:
            this.erro = "O e-mail já está sendo utilizado.";
            break;
          default:
            this.erro = "Ocorreu um erro. Tente novamente mais tarde.";
            break;
        }
      } else {
        this.sucesso = true;
        window.scrollTo(0, this.$refs.inscricao.offsetTop);
      }
    },
    erro: "",
    sucesso: false,
  };
}
