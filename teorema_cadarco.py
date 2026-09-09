from manim import *

config.background_color = WHITE


class FiguraCompletaCadarco(Scene):
    def construct(self):
        self.camera.background_color = WHITE

        pontos = {
            "A": (1, 5),
            "B": (5, 8),
            "C": (6, 5),
            "D": (8, 3),
            "E": (3, -1),
            "F": (4, 3),
            "G": (1, 4),
        }
        ordem = ["A", "B", "C", "D", "E", "F", "G"]

        titulo = Text(
            "Teorema do Cadarço — exemplo de cálculo da área",
            font_size=32,
            weight=BOLD,
            color=BLACK,
        ).to_edge(UP, buff=0.35)

        painel_esquerdo = self.criar_painel_poligono(pontos, ordem)
        painel_esquerdo.scale(0.96).to_edge(LEFT, buff=0.35).shift(DOWN * 0.2)

        painel_direito = self.criar_painel_cadarco(pontos, ordem)
        painel_direito.scale(0.96).to_edge(RIGHT, buff=0.35).shift(DOWN * 0.15)

        self.add(titulo, painel_esquerdo, painel_direito)

    def criar_painel_poligono(self, pontos, ordem):
        axes = Axes(
            x_range=[0, 9, 1],
            y_range=[-2, 9, 1],
            x_length=6.0,
            y_length=6.0,
            tips=False,
            axis_config={
                "include_numbers": True,
                "font_size": 18,
                "color": GREY_B,
                "stroke_width": 2,
            },
        )

        eixo_labels = axes.get_axis_labels(
            Text("x", font_size=22, color=BLACK),
            Text("y", font_size=22, color=BLACK),
        )

        coords = [pontos[nome] for nome in ordem]
        pts_cena = [axes.c2p(x, y) for x, y in coords]

        poligono = Polygon(
            *pts_cena,
            stroke_color=BLUE_D,
            stroke_width=4,
            fill_color=BLUE_C,
            fill_opacity=0.18,
        )

        dots = VGroup(
            *[
                Dot(axes.c2p(*pontos[nome]), radius=0.06, color=BLUE_D)
                for nome in ordem
            ]
        )

        direcoes = {
            "A": UL,
            "B": UR,
            "C": RIGHT,
            "D": RIGHT,
            "E": DOWN,
            "F": LEFT,
            "G": LEFT,
        }

        rotulos = VGroup()
        for nome in ordem:
            x, y = pontos[nome]
            rotulo = Text(
                f"{nome} = ({x}, {y})",
                font_size=21,
                color=BLACK,
            )
            rotulo.next_to(
                axes.c2p(x, y),
                direcoes[nome],
                buff=0.08,
            )
            rotulos.add(rotulo)

        subtitulo = Text(
            "Polígono simples no plano cartesiano",
            font_size=26,
            weight=BOLD,
            color=BLACK,
        ).next_to(axes, UP, buff=0.25)

        return VGroup(subtitulo, axes, eixo_labels, poligono, dots, rotulos)

    def criar_painel_cadarco(self, pontos, ordem):
        lista = [pontos[nome] for nome in ordem]
        lista_fechada = lista + [lista[0]]

        soma_desc = sum(lista_fechada[i][0] * lista_fechada[i + 1][1] for i in range(len(lista)))
        soma_sub = sum(lista_fechada[i][1] * lista_fechada[i + 1][0] for i in range(len(lista)))
        area = abs(soma_desc - soma_sub) / 2

        titulo = Text(
            "Aplicando a Fórmula de Gauss",
            font_size=26,
            weight=BOLD,
            color=BLACK,
        )

        # tabela manual
        x_col = -0.65
        y_col = 0.65
        y_inicio = 2.3
        passo = 0.52

        cab_x = Text("x", font_size=26, weight=BOLD, color=BLACK).move_to([x_col, y_inicio + 0.55, 0])
        cab_y = Text("y", font_size=26, weight=BOLD, color=BLACK).move_to([y_col, y_inicio + 0.55, 0])

        x_entries = []
        y_entries = []
        tabela_itens = VGroup(cab_x, cab_y)

        for i, (xv, yv) in enumerate(lista_fechada):
            y_pos = y_inicio - i * passo
            tx = Text(str(xv), font_size=24, color=BLACK).move_to([x_col, y_pos, 0])
            ty = Text(str(yv), font_size=24, color=BLACK).move_to([y_col, y_pos, 0])
            x_entries.append(tx)
            y_entries.append(ty)
            tabela_itens.add(tx, ty)

        altura_tabela = 5.0
        largura_tabela = 2.15

        borda = Rectangle(
            width=largura_tabela,
            height=altura_tabela,
            color=GREY_B,
            stroke_width=2,
        ).move_to([0, 0.18, 0])

        divisor = Line(
            [0, -2.3, 0],
            [0, 2.65, 0],
            color=GREY_B,
            stroke_width=2,
        )

        linha_header = Line(
            [-1.05, y_inicio + 0.27, 0],
            [1.05, y_inicio + 0.27, 0],
            color=GREY_B,
            stroke_width=2,
        )

        diagonais_desc = VGroup()
        diagonais_sub = VGroup()

        for i in range(len(lista)):
            l1 = Line(
                x_entries[i].get_center() + RIGHT * 0.10,
                y_entries[i + 1].get_center() + LEFT * 0.10,
                color=GREEN_D,
                stroke_width=3,
            )
            diagonais_desc.add(l1)

            l2 = Line(
                y_entries[i].get_center() + LEFT * 0.10,
                x_entries[i + 1].get_center() + RIGHT * 0.10,
                color=RED_D,
                stroke_width=3,
            )
            diagonais_sub.add(l2)

        tabela = VGroup(borda, divisor, linha_header, tabela_itens, diagonais_desc, diagonais_sub)

        desc1 = Text(
            "Descendo:",
            font_size=22,
            weight=BOLD,
            color=GREEN_D,
        )
        desc2 = Text(
            "1×8 + 5×5 + 6×3 + 8×(-1) + 3×3 + 4×4 + 1×5 = 73",
            font_size=21,
            color=BLACK,
        )

        sub1 = Text(
            "Subindo:",
            font_size=22,
            weight=BOLD,
            color=RED_D,
        )
        sub2 = Text(
            "5×5 + 8×6 + 5×8 + 3×3 + (-1)×4 + 3×1 + 4×1 = 125",
            font_size=21,
            color=BLACK,
        )

        formula = Text(
            f"Área = |{soma_desc} - {soma_sub}| / 2 = {area:.0f}",
            font_size=25,
            weight=BOLD,
            color=BLACK,
        )

        legenda_cores = VGroup(
            Text("Linhas verdes: produtos descendentes", font_size=18, color=GREEN_D),
            Text("Linhas vermelhas: produtos ascendentes", font_size=18, color=RED_D),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.12)

        bloco_texto = VGroup(
            VGroup(desc1, desc2).arrange(RIGHT, buff=0.18, aligned_edge=DOWN),
            VGroup(sub1, sub2).arrange(RIGHT, buff=0.18, aligned_edge=DOWN),
            formula,
            legenda_cores,
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22)

        painel = VGroup(titulo, tabela, bloco_texto).arrange(DOWN, buff=0.28)
        return painel


class PoligonoComCoordenadas(Scene):
    def construct(self):
        self.camera.background_color = WHITE

        pontos = {
            "A": (1, 5),
            "B": (5, 8),
            "C": (6, 5),
            "D": (8, 3),
            "E": (3, -1),
            "F": (4, 3),
            "G": (1, 4),
        }
        ordem = ["A", "B", "C", "D", "E", "F", "G"]

        axes = Axes(
            x_range=[0, 9, 1],
            y_range=[-2, 9, 1],
            x_length=8.0,
            y_length=6.2,
            tips=False,
            axis_config={
                "include_numbers": True,
                "font_size": 20,
                "color": GREY_B,
                "stroke_width": 2,
            },
        )

        titulo = Text(
            "Polígono simples com vértices coordenados",
            font_size=30,
            weight=BOLD,
            color=BLACK,
        ).to_edge(UP, buff=0.35)

        eixo_labels = axes.get_axis_labels(
            Text("x", font_size=24, color=BLACK),
            Text("y", font_size=24, color=BLACK),
        )

        coords = [pontos[nome] for nome in ordem]
        pts_cena = [axes.c2p(x, y) for x, y in coords]

        poligono = Polygon(
            *pts_cena,
            stroke_color=BLUE_D,
            stroke_width=4,
            fill_color=BLUE_C,
            fill_opacity=0.18,
        )

        dots = VGroup(
            *[
                Dot(axes.c2p(*pontos[nome]), radius=0.07, color=BLUE_D)
                for nome in ordem
            ]
        )

        direcoes = {
            "A": UL,
            "B": UR,
            "C": RIGHT,
            "D": RIGHT,
            "E": DOWN,
            "F": LEFT,
            "G": LEFT,
        }

        rotulos = VGroup()
        for nome in ordem:
            x, y = pontos[nome]
            rotulo = Text(
                f"{nome} = ({x}, {y})",
                font_size=24,
                color=BLACK,
            )
            rotulo.next_to(axes.c2p(x, y), direcoes[nome], buff=0.08)
            rotulos.add(rotulo)

        grupo = VGroup(axes, eixo_labels, poligono, dots, rotulos).shift(DOWN * 0.15)
        self.add(titulo, grupo)


class CalculoCadarco(Scene):
    def construct(self):
        self.camera.background_color = WHITE

        pontos = [(1, 5), (5, 8), (6, 5), (8, 3), (3, -1), (4, 3), (1, 4)]
        pontos_fechados = pontos + [pontos[0]]

        soma_desc = sum(pontos_fechados[i][0] * pontos_fechados[i + 1][1] for i in range(len(pontos)))
        soma_sub = sum(pontos_fechados[i][1] * pontos_fechados[i + 1][0] for i in range(len(pontos)))
        area = abs(soma_desc - soma_sub) / 2

        titulo = Text(
            "Exemplo do Teorema do Cadarço",
            font_size=30,
            weight=BOLD,
            color=BLACK,
        ).to_edge(UP, buff=0.35)

        x_col = -0.75
        y_col = 0.75
        y_inicio = 2.4
        passo = 0.58

        cab_x = Text("x", font_size=28, weight=BOLD, color=BLACK).move_to([x_col, y_inicio + 0.6, 0])
        cab_y = Text("y", font_size=28, weight=BOLD, color=BLACK).move_to([y_col, y_inicio + 0.6, 0])

        x_entries = []
        y_entries = []
        tabela_itens = VGroup(cab_x, cab_y)

        for i, (xv, yv) in enumerate(pontos_fechados):
            y_pos = y_inicio - i * passo
            tx = Text(str(xv), font_size=26, color=BLACK).move_to([x_col, y_pos, 0])
            ty = Text(str(yv), font_size=26, color=BLACK).move_to([y_col, y_pos, 0])
            x_entries.append(tx)
            y_entries.append(ty)
            tabela_itens.add(tx, ty)

        borda = Rectangle(width=2.4, height=5.5, color=GREY_B, stroke_width=2).move_to([0, 0.18, 0])
        divisor = Line([0, -2.55, 0], [0, 2.95, 0], color=GREY_B, stroke_width=2)
        linha_header = Line([-1.2, y_inicio + 0.3, 0], [1.2, y_inicio + 0.3, 0], color=GREY_B, stroke_width=2)

        diagonais_desc = VGroup()
        diagonais_sub = VGroup()

        for i in range(len(pontos)):
            diagonais_desc.add(
                Line(
                    x_entries[i].get_center() + RIGHT * 0.10,
                    y_entries[i + 1].get_center() + LEFT * 0.10,
                    color=GREEN_D,
                    stroke_width=3,
                )
            )
            diagonais_sub.add(
                Line(
                    y_entries[i].get_center() + LEFT * 0.10,
                    x_entries[i + 1].get_center() + RIGHT * 0.10,
                    color=RED_D,
                    stroke_width=3,
                )
            )

        tabela = VGroup(borda, divisor, linha_header, tabela_itens, diagonais_desc, diagonais_sub).to_edge(LEFT, buff=1.2)

        textos = VGroup(
            Text("Descendo:", font_size=24, weight=BOLD, color=GREEN_D),
            Text("1×8 + 5×5 + 6×3 + 8×(-1) + 3×3 + 4×4 + 1×5 = 73", font_size=22, color=BLACK),
            Text("Subindo:", font_size=24, weight=BOLD, color=RED_D),
            Text("5×5 + 8×6 + 5×8 + 3×3 + (-1)×4 + 3×1 + 4×1 = 125", font_size=22, color=BLACK),
            Text(f"Área = |{soma_desc} - {soma_sub}| / 2 = {area:.0f}", font_size=26, weight=BOLD, color=BLACK),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.22).to_edge(RIGHT, buff=0.7)

        self.add(titulo, tabela, textos)