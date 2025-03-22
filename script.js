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
    carregarPaginacao()
  
})

function carregarTabela() {
    let linhas = retornaLinhas();
    let inicio = (paginaAtual - 1) * itensPorPagina;
    let fim = inicio + itensPorPagina;
    let dadosPagina = linhas.slice(inicio, fim);

    $('#corpoTabela').html(
        dadosPagina.map(linha => `
            <tr id="${linha.id}" class="linhaTabela">
                <td class="conteudoTabela checkBoxTbl"><input type="checkbox"></td>
                <td class="conteudoTabela id" disabled>${linha.conteudo.indice}</td>
                ${linha.conteudo.colunas.map(coluna => `<td class="conteudoTabela" contenteditable="true">${coluna}</td>`).join('')}
            </tr>
        `).join('')
    );
}

function retornaLinhas() {
    let linhas = JSON.parse(localStorage.getItem('linhas')) || [];
    return linhas;
}



function carregarPaginacao() {
    let linhas = retornaLinhas();  
    let totalPaginas = Math.ceil(linhas.length / itensPorPagina);
    totalPaginas = totalPaginas === 0 ? 1 : totalPaginas;
    let paginacaoHTML = ''; 

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

    // Navegar entre páginas
    $('.page-num').click(function (e) {
        e.preventDefault();
        paginaAtual = parseInt($(this).data('page'));
        carregarTabela();
        carregarPaginacao();
    });

    // Navegar para a página anterior
    $('.prev-page').click(function (e) {
        e.preventDefault();
        if (paginaAtual > 1) {
            paginaAtual--;
            carregarTabela();
            carregarPaginacao();
        }
    });

    // Navegar para a próxima página
    $('.next-page').click(function (e) {
        e.preventDefault();
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            carregarTabela();
            carregarPaginacao();
        }
    });
}

function salvamentoLocal() {
    var id = $('tr[class^="linhaTabela"]');
    count = id.length;
    formataIds(id,count)
    salvarDados();
}

function recuperarDados() {
    var id = $('tr[class^="linhaTabela"]');
    count = id.length;
    var linhasSalvas = JSON.parse(localStorage.getItem('linhas'));
    if (linhasSalvas) {
        linhasSalvas.forEach(function(linha, index) {
            if (index > 0) { 
                AddRow('',true,linha.conteudo.indice);
            }
        });
    }
}


function salvarDados() {
    localStorage.setItem('indice', indice);  

    var linhasSalvas = [];
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

        linhasSalvas.push(novaLinha);
    });
    if (linhasSalvas.length/10 == 0){
        carregarPaginacao()
    }

    localStorage.setItem('linhas', JSON.stringify(linhasSalvas));  

    let totalPaginas = Math.ceil(linhasSalvas.length / 10);

    // Ajusta a página atual se necessário
    if (paginaAtual > totalPaginas) {
        paginaAtual = totalPaginas;
    }

    // Atualiza a paginação e a tabela
    carregarPaginacao();
    carregarTabela();

}


function formataIds(id,count)
   {
     if (count > 0) 
        {
            if($('#linha_I___').length > 0 ){
                $('#linha_I___').attr('id','linha_0')
            }
            for (let i = 0; i < count; i++) {
                $(id[i]).attr('id', atualizarId($(id[i]).attr('id'), i));
                var tdsArray = $('#linha_' + i).find('td');
            
                for (let j = 0; j < tdsArray.length; j++) {
                    $(tdsArray[j]).attr('id', atualizarId($(tdsArray[j]).attr('id'), i));
                }
            }
            
     
        }
   }


function atualizarId(id, indice) {
    return id.replace(/I___\d*$/, indice);
}

function AddRow(htmlElement,indiceRecuperado = false,posicaoIndice) {
    var ids = [];  
    var arrConteudo = ["checkbox_I___", "idUnico_I___", "nome_I___", "desc_I___", "tag_I___", "data_I___"];
    
    for (let i = 0; i < arrConteudo.length; i++) {
        var elemento = arrConteudo[i]
        if (elemento) {  
            ids.push(elemento);  
        }
    }

    if (!indiceRecuperado) {
        var html = '<tr id="linha_' + indice + '" class="linhaTabela">'; 
        html += '<td id="' + ids[0] + indice + '" class="conteudoTabela checkBoxTbl"><input type="checkbox"></td>';
        html += '<td id="' + ids[1] + indice + '" class="conteudoTabela id" generico disabled>' + indice + '</td>';
        html += '<td id="' + ids[2] + indice + '" class="conteudoTabela" generico contenteditable="true"></td>';
        html += '<td id="' + ids[3] + indice + '" class="conteudoTabela descricao" contenteditable="true"></td>';
        html += '<td id="' + ids[4] + indice + '" class="conteudoTabela" generico contenteditable="true"></td>';
        html += '<td id="' + ids[5] + indice + '" class="conteudoTabela" generico contenteditable="true"></td>';
        html += '</tr>';
        $('#corpoTabela').append(html);
        indice++;  
    } else {
        var conteudos = JSON.parse(localStorage.getItem('linhas')); 
        if (conteudos) {
            conteudos.forEach((linha, index) => {
                var posicaoIndice = linha.conteudo.indice;
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

 