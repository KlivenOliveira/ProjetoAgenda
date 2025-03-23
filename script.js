var indice = localStorage.getItem('indice') ? parseInt(localStorage.getItem('indice')) : 0;
let paginaAtual = 1;
const itensPorPagina = 15;
var novoId = ''
$( document ).ready(function(){
    
    recuperarDados() 
    var id = $('tr[class^="linhaTabela"]');
    count = id.length;
    if(count == 0){
        AddRow('',false)
    } else {
        AddRow('',true)
    }

    mudaCampos();
})



function retornaLinhas() {
    let linhas = JSON.parse(localStorage.getItem('linhas')) || [];
    return linhas;
}



function carregarPaginacao(totalPaginas) {
    let paginacaoHTML = '';
    
    // Garante que o total de páginas seja sempre pelo menos 1
    totalPaginas = totalPaginas === 0 ? 1 : totalPaginas;

    for (let i = 1; i <= totalPaginas; i++) {
        paginacaoHTML += `<li class="page-item ${i === paginaAtual ? 'ativo' : ''}">
            <a class="page-link page-num" href="#" data-page="${i}">${i}</a>
        </li>`;
    }

    $('.pagination').html(`
        <li class="page-item ${paginaAtual === 1 ? 'disabled' : ''}">
            <a class="page-link prev-page" href="#"><i class="fas fa-chevron-left"></i></a>
        </li>
        ${paginacaoHTML}
        <li class="page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link next-page" href="#"><i class="fas fa-chevron-right"></i></a>
        </li>
    `);

    // Navegação de páginas
    $('.page-num').click(function (e) {
        e.preventDefault();
        paginaAtual = parseInt($(this).data('page'));
        recuperarDados();  // Atualiza os dados ao mudar de página
    });

    // Navegação anterior e próxima
    $('.prev-page').click(function (e) {
        e.preventDefault();
        if (paginaAtual > 1) {
            paginaAtual--;
            recuperarDados();
        }
    });

    $('.next-page').click(function (e) {
        e.preventDefault();
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            recuperarDados();
        }
    });
}

function salvamentoLocal() {
    var id = $('tr[class^="linhaTabela"]');
    console.log(id)
    count = id.length;
    formataIds(id,count)

    salvarDados();
}

function salvarDados() {
    // Recupera as linhas salvas no localStorage ou cria um array vazio caso não haja
    let linhasSalvas = JSON.parse(localStorage.getItem('linhas')) || [];
    
    // Cria um array temporário para armazenar as linhas visíveis na tela
    let linhasVisiveis = [];

    // Processa todas as linhas visíveis na tabela
    $('#corpoTabela tr').each(function () {
        var linhaId = $(this).attr('id');
        var novaLinha = {
            id: linhaId,
            conteudo: {
                indice: linhaId.split('_')[1],  
                colunas: []
            }
        };

        $(this).find('td').each(function (i, td) {
            if ($(td).attr('contenteditable') === 'true') {
                novaLinha.conteudo.colunas.push($(td).text());
            }
        });

        linhasVisiveis.push(novaLinha); // Adiciona a linha visível ao array temporário
    });

    // Verifica se a linha já existe no localStorage antes de adicionar
    linhasVisiveis.forEach(function(novaLinha) {
        // Verifica se algum item com o mesmo indice já existe nas linhas salvas
        let indexExistente = linhasSalvas.findIndex(function(linha) {
            return linha.conteudo.indice === novaLinha.conteudo.indice;
        });

        // Se não encontrar o índice, a linha é adicionada
        if (indexExistente === -1) {
            linhasSalvas.push(novaLinha);
        }
    });

    // Salva as linhas no localStorage, sem duplicação
    localStorage.setItem('linhas', JSON.stringify(linhasSalvas));

    // Recalcula o número total de páginas
    let totalPaginas = Math.ceil(linhasSalvas.length / 10);
    if (paginaAtual > totalPaginas) {
        paginaAtual = totalPaginas;
    }

    // Atualiza a tabela com os dados mais recentes
    recuperarDados();
}



function formataIds(id,count)
   {
    var tr = [] 
     if (count > 0) 
        {
            if($('#linha_I___').length > 0 ){
                $('#linha_I___').attr('id','linha_0')
            }
       
            for (let i = 0; i < count; i++) {
                $(id[i]).attr('id', atualizarId($(id[i]).attr('id'), i));
                tr.push(id[i].id)
                var tdsArray = $('#'+tr[i]).find('td');
                var numeracaoLinha = tr[i].split('_')[1]
                console.log(tdsArray)
                for (let j = 0; j < tdsArray.length; j++) {
                    $(tdsArray[j]).attr('id', atualizarId($(tdsArray[j]).attr('id'), numeracaoLinha));
                }
            }
        }
   }

   function mudaCampos() {
    $(".conteudoTabela").on("input", function () {
        let valor = $(this).text();

        if ($(this).hasClass("numerico")) {
            $(this).text(valor.replace(/\D/g, "")); // Permite apenas números
        } 
        else if ($(this).hasClass("data")) {
            $(this).text(valor.replace(/[^0-9\/]/g, "")); // Permite números e "/"
        } 
        else if ($(this).hasClass("valorNumerico")) {
            // Remove tudo que não for número
            let valorLimpo = valor.replace(/\D/g, "");

            if (valorLimpo.length > 0) {
                // Garante que seja tratado como um número e formata corretamente
                let valorFormatado = (parseInt(valorLimpo, 10) / 100).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                });

                $(this).text(valorFormatado);

                // Mantém o cursor no final do texto
                let range = document.createRange();
                let sel = window.getSelection();
                range.selectNodeContents(this);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            } else {
                $(this).text("0,00"); // Mantém o formato se estiver vazio
            }
        }
    });
}


function adicionaNumeros(htmlElement){
    let valor = $(htmlElement).text();   
    if (valor.includes(',')) {
        $(htmlElement).text(valor + 'R$');
    }
}


function atualizarId(id, indice) {
    return id.replace(/I___\d*$/, indice);
}


function recuperarDados() {
    $('#corpoTabela').html('');
    let inicio = (paginaAtual - 1) * itensPorPagina;  
    let fim = inicio + itensPorPagina;
    var linhasSalvas = JSON.parse(localStorage.getItem('linhas'));
    if (linhasSalvas) {
        var arrayPaginado = linhasSalvas.slice(inicio,fim)
        arrayPaginado.forEach(function(linha, index) {
            if (index < 15) { 
                AddRow('',true,linha.conteudo.indice,arrayPaginado);
            }
        });
    }
    if(linhasSalvas){
    let totalLinhas = linhasSalvas.length;
    let totalPaginas = Math.ceil(totalLinhas / 10);
    carregarPaginacao(totalPaginas)
    }
}
function AddRow(htmlElement, indiceRecuperado = false, posicaoIndice, arrayPaginado) {
    var ids = [];
    var arrConteudo = ["checkbox_I___", "idUnico_I___", "nome_I___", "desc_I___", "tipo_I___", "tag_I___", "responsavel_I___", "data_I___", "valor_I__", "prioridade_I___", "pago_I___"];
    
    for (let i = 0; i < arrConteudo.length; i++) {
        var elemento = arrConteudo[i];
        if (elemento) {
            ids.push(elemento);
        }
    }

    // Se o índice não for recuperado, significa que é uma nova linha
    if (!indiceRecuperado) {
        var html = '<tr id="linha_' + indice + '" class="linhaTabela">';
        html += '<td id="' + ids[0] + indice + '" class="conteudoTabela checkBoxTbl"><input type="checkbox"></td>';
        html += '<td id="' + ids[1] + indice + '" class="conteudoTabela id" disabled>' + indice + '</td>';
        html += '<td id="' + ids[2] + indice + '" class="conteudoTabela generico" contenteditable="true"></td>';
        html += '<td id="' + ids[3] + indice + '" class="conteudoTabela descricao" contenteditable="true"></td>';
        html += '<td id="' + ids[4] + indice + '" class="conteudoTabela select generico" contenteditable="true"></td>';
        html += '<td id="' + ids[5] + indice + '" class="conteudoTabela tags" contenteditable="true"></td>';
        html += '<td id="' + ids[6] + indice + '" class="conteudoTabela generico" contenteditable="true"></td>';
        html += '<td id="' + ids[7] + indice + '" class="conteudoTabela data generico" contenteditable="true"></td>';
        html += '<td id="' + ids[8] + indice + '" class="conteudoTabela valorNumerico generico" placeholder="0,00" onBlur="adicionaNumeros(this)" contenteditable="true"></td>';
        html += '<td id="' + ids[9] + indice + '" class="conteudoTabela select generico" contenteditable="true"></td>';
        html += '<td id="' + ids[9] + indice + '" class="conteudoTabela select generico" contenteditable="true"></td>';
        html += '</tr>';
        
        // Adiciona a linha ao corpo da tabela
        $('#corpoTabela').append(html);
        indice++; // Incrementa o índice para a próxima linha

    } else {
        // Quando for uma linha recuperada, não é necessário criar um novo índice
        var conteudos = JSON.parse(localStorage.getItem('linhas'));
        if (arrayPaginado) {
            arrayPaginado.forEach((linha, index) => {
                var posicaoIndice = linha.conteudo.indice;
                // Verifica se a linha já existe, se não, cria a linha
                if ($('#linha_' + posicaoIndice).length === 0) {
                    var html = '<tr id="linha_' + posicaoIndice + '" class="linhaTabela">';
                    html += '<td id="' + ids[0] + posicaoIndice + '" class="conteudoTabela checkBoxTbl"><input type="checkbox"></td>';
                    html += '<td id="' + ids[1] + posicaoIndice + '" class="conteudoTabela" disabled>' + posicaoIndice + '</td>';
                    
                    let colunas = linha.conteudo.colunas;
                    colunas.forEach((conteudo, colIndex) => {
                        var classe = colIndex + 3 === 4 ? 'descricao' : 'generico';
                        html += '<td id="' + ids[colIndex + 2] + posicaoIndice + '" class="conteudoTabela ' + classe + '" contenteditable="true">' + conteudo + '</td>';
                    });
                    html += '</tr>';
                    $('#corpoTabela').append(html);
                }
            });
        }
    }

    if(conteudos){
    let totalLinhas = conteudos.length;
    let totalPaginas = Math.ceil(totalLinhas / 10);
    carregarPaginacao(totalPaginas);
    }
}


    function  exibirAlerta(text) {
        return Swal.fire({
            title: 'Confirmacao',
            text: text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            return result.isConfirmed;
        });
    }
    
    function selecionarTudo() {
        // Desabilita o primeiro checkbox (já feito)
    
        // Seleciona todos os checkboxes, exceto o primeiro
        var todos_inputs = $('#corpoTabela input[type="checkbox"]')
        var icone = $('#selecionarTudo i');
        
        // Verifica se todos os checkboxes estão marcados
        var todosMarcados = todos_inputs.length === todos_inputs.filter(':checked').length;
    
        if (todosMarcados) {
            // Desmarca todos os checkboxes
            todos_inputs.prop('checked', false);
            icone.removeClass('fa-check-square').addClass('fa-square');
        } else {
            // Marca todos os checkboxes
            todos_inputs.prop('checked', true);
            icone.removeClass('fa-square').addClass('fa-check-square');
        }
    }
    
async function removeRow(){
    var arrChecados = $('td.checkBoxTbl input[type="checkbox"]:checked');
    text  = ''
    if(arrChecados.length == 0 ){
         text = 'Nenhuma linha foi selecionada'
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: text,
          });
          return;
    }
    text = arrChecados.length == 1? 'Deseja apagar linha selecionada?':'Deseja apagar linhas selecionadas?'
    const confirma = await exibirAlerta(text);
    let idsParaRemover = []
     if(confirma){
    textoConfirma = arrChecados.length == 1?'Linha apagada como sucesso':'Linhas apagadas com sucesso'
     arrChecados.each(function() {
        var tr = $(this).closest('tr'); 
        idsParaRemover.push(tr[0].id);
    });

    let linhaString = localStorage.getItem('linhas');
    let linhasSelecionadas = linhaString ? JSON.parse(linhaString) : [];
    linhasSelecionadas = linhasSelecionadas.filter(item => !idsParaRemover.includes(item.id));
    localStorage.setItem('linhas', JSON.stringify(linhasSelecionadas));
    idsParaRemover.forEach(id => $('#' + id).remove());
    Swal.fire('Confirmado!', textoConfirma);
    }
    else{
        Swal.fire('Cancelado!', 'Operação cancelada', 'error');
        return
    }
}

 