
console.log("Pagina carregada!");


var APIurl = 'https://mid-homolog.totvs.com:4007/api/v2';
var catalog_combo_template =    '<label for="sel{{counter}}">{{name}}:</label><br>';
catalog_combo_template +=       '<select style="height=28px; width: ' + selectElementWidth + ';" ';
catalog_combo_template +=       'class="form-control form-catalogo" {{status}} id="sel{{counter}}">';
catalog_combo_template +=           '<option value=""></option>';
catalog_combo_template +=       '</select>';
var cataloghtml = '<div class="form-catalogo catalogo-combos">';
var campos = [];

//===CATALOG V2 API===
function catalogV2API(method, endpoint, data, cb){
    $.ajax({
        "url": APIurl + endpoint,
        "type": method,
        "contentType": "application/json",
        "dataType": "json",
        "data": JSON.stringify(data),
        "Accept": "application/json",
        "success": function (response) {
            cb(response);
        },
        "error": function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
            cb("Erro na operação!")
        }
    });
}
//======


//===SET SELECT2 ON TARGET ELEMENT===
function setSelect2(camposIndex, endpoint){
    $('#sel' + camposIndex).html('');
    $('#sel' + camposIndex).select2({
        ajax: {
            url: APIurl + endpoint,
            dataType: 'json',
            delay: 250,
            data: function (params) {
                console.log(params);
                return {
                    name: params.term// search term
                };
            },
            processResults: function (data, params) {
                console.log(data);
                console.log(params);
                // parse the results into the format expected by Select2
                // since we are using custom formatting functions we do not need to
                // alter the remote JSON data, except to indicate that infinite
                // scrolling can be used
                params.page = params.page || 1;

                return {

                    results: $.map(data.opcoes_campos, function (item) {
                        console.log(item);
                        //var id_tag_zendesk = item.id + '|' + item.tag_zendesk;
                        return {
                            text: item.nome,
                            id: item.id
                        }
                    })
                    //results: data.items
                };
            },
            cache: true
        }
    });
}
//======

catalogV2API('GET', '/campos', '', function(response){
	campos = response.campos;
	console.log(campos);
	console.log(campos.length);

	for(var i=0; i<campos.length; i++){
        var html = catalog_combo_template;
        html = html.replace(/{{counter}}/g, i);
        html = html.replace('{{name}}', campos[i].nome);
        if(i == 0)
            html = html.replace('{{status}}', 'enabled');
        else
            html = html.replace('{{status}}', 'disabled');
        //$('.catalogo-combos').append(html);
        cataloghtml += html + '<br><br>';
    }
    cataloghtml += '</div>';
    document.getElementById("catalogV2").innerHTML = cataloghtml;


    //===GENERATE FIRST COMBO OPTIONS===
    $('.form-control').select2();
    setSelect2(0, '/opcoes_campos?id_campo=' + campos[0].id);
    //======

    //===CATALOG BOXES DEPENDENCIES===
    $('.form-catalogo').change(function(){

        //===exit if position is the last combo===
        var comboAtualIndex = Number(this.id.substring(3,this.id.length));
        if(comboAtualIndex == campos.length-1){
            return;
        }
        //======

        //===set url endpoint for select2===
        var url = '/opcoes_campos?relacionamentos[opcoes]='
        for(var i=0; i<=comboAtualIndex; i++){
            url += campos[comboAtualIndex].id + ':' + $('#sel' + i).val() + ' ';
        }
        url += '&id_campo=' + campos[comboAtualIndex+1].id;
        console.log('#sel' + (comboAtualIndex+1));
        $('#sel' + (comboAtualIndex+1)).attr("disabled", false);
        $('#sel' + (comboAtualIndex+1)).val('');
        setSelect2(comboAtualIndex + 1, url);
        //======

        //===disable affected combos===
        for (var j=comboAtualIndex+2; j<campos.length; j++){
            console.log("apagou combos");
            $('#sel' + j).prop("disabled", true);
            $('#sel' + j).val("");
            $('#sel' + j).text("");
        }
        //======
    });
    //======

});


