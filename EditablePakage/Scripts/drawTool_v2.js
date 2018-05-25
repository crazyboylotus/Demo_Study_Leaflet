/**
 * Created by 世莲 on 2018/4/11.
 */
$(function(){
    $("#pStyleSelect").unbind("click").click(function () {
        if ($("#pointStyles").css("display") == "none") {
            $("#pointStyles").show();
        }
        else {
            $("#pointStyles").hide();
        }
        $("#pointStyles").children("li").each(function () {
            $(this).unbind("click").click(function () {
                $("#pStyleSelect").children().eq(0).children().eq(0).attr("src", $(this).children("a").eq(0).children().eq(0).attr("src"));
                $("#pointStyles").hide();
            });
        });
    });
    $("#drawTools").draggable();
    $('#BKColor').colorpicker({ color: '#31859b' });
    $('#LineColor').colorpicker({ color: '#31859b' });
    $('#StyleColor').colorpicker({ color: '#31859b' });
    lMap.initEditToCustom();
    lMap.initMap();

});
var lMap = {
    basemap:{
        normalm:L.tileLayer.chinaProvider('GaoDe.Normal.Map', {
            maxZoom: 18,
            minZoom: 4
        }),
        imgm:L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {
            maxZoom: 18,
            minZoom: 5
        }),
        imga:L.tileLayer.chinaProvider('GaoDe.Satellite.Annotion', {
            maxZoom: 18,
            minZoom: 5
        })
    },
    overlayer:{
        draw_toolbar:new L.FeatureGroup(),
        draw_daynamic:new L.FeatureGroup()
    },
    map:null,
    initMap:function(){
        var normal = L.layerGroup([lMap.basemap.normalm]),
            image = L.layerGroup([lMap.basemap.imgm, lMap.basemap.imga]);
        var wms = L.tileLayer.wms("http://localhost:8080/geoserver/wms",{
            layers: 'Test:states',
            format: 'image/png',
            transparent: true,
            attribution: "my wms layer"
        });

        var baseLayers = {
            "地图": normal,
            "影像": image,
        }
        var overlayers = {
            "图形绘制":lMap.overlayer.draw_toolbar,
            "动态数据":lMap.overlayer.draw_daynamic
        };
        lMap.map = L.map("mapDiv", {
            center: [36.12, 120.41],
            zoom: 11,
            layers: [normal,wms,lMap.overlayer.draw_toolbar,lMap.overlayer.draw_daynamic],
            zoomControl: false,
            editable: true,
            renderer: L.canvas(),
            editOptions:{
                lineGuideOptions: {
                    color:'red',
                    weight:1
                },
                //editLayer:lMap.overlayer.draw_toolbar,
                featuresLayer:lMap.overlayer.draw_toolbar

            }
        });

        //图层控制
        L.control.layers(baseLayers, overlayers,{
            collapsed:false
        }).addTo(lMap.map);
        //缩放图层
        L.control.zoom({
            zoomInTitle: '放大',
            zoomOutTitle: '缩小'
        }).addTo(lMap.map);
        //lMap.bindToolbarEvt();
        lMap.bindToolbarEvtCustom();
        lMap.bindEditGeoEvt();
        //lMap.addMultiGeoDemo();
    },
    //初始化自定义的编辑
    initEditToCustom:function(){

    },
    //自定义的绘制工具
    bindToolbarEvtCustom:function(){
        $("#point").unbind("click").bind("click",function(){
            var iconSize= parseFloat($("#StyleSize").val())*20;
            lMap.map.editTools.options.markerClass = L.Marker.extend({
                options:{
                    icon:L.icon({
                        iconUrl: $("#pStyleSelect>label>img").attr("src"),
                        iconSize: [iconSize, iconSize],
                        iconAnchor: [iconSize/2, iconSize],
                    }),
                }
            });
            lMap.map.editTools.startMarker();
        });
        $("#line").unbind("click").bind("click",function(){
            lMap.map.editTools.options.polylineClass = L.Polyline.extend({
                options:{
                    color:$("#LineColor").val(),
                    weight:$("#LineWidth").val(),
                    opacity:$("#StyleOpcity").val(),
                }
            });
            lMap.map.editTools.startPolyline();
        });
        $("#polygon").unbind("click").bind("click",function(){
            lMap.map.editTools.options.polygonClass = L.Polygon.extend({
                options:{
                    color:$("#LineColor").val(),
                    weight:$("#LineWidth").val(),
                    //opacity:$("#StyleOpcity").val(),
                    fillColor:$("#StyleColor").val(),
                    fillOpacity:$("#StyleOpcity").val()
                }
            });
            lMap.map.editTools.startPolygon();
        });

        $("#circle").unbind("click").bind("click",function(){
            lMap.map.editTools.options.circleClass = L.Circle.extend({
                options:{
                    color:$("#LineColor").val(),
                    weight:$("#LineWidth").val(),
                    //opacity:$("#StyleOpcity").val(),
                    fillColor:$("#StyleColor").val(),
                    fillOpacity:$("#StyleOpcity").val()
                }
            });
            lMap.map.editTools.startCircle();
        });
        $("#rectangle").unbind("click").bind("click",function(){
            lMap.map.editTools.options.rectangleClass = L.Rectangle.extend({
                options:{
                    color:$("#LineColor").val(),
                    weight:$("#LineWidth").val(),
                    //opacity:$("#StyleOpcity").val(),
                    fillColor:$("#StyleColor").val(),
                    fillOpacity:$("#StyleOpcity").val()
                }
            });
            lMap.map.editTools.startRectangle();
        });
        $("#sector").unbind("click").bind("click",function(){
            lMap.map.editTools.options.SectorClass= L.SemiCircle.extend({
                options:{
                    color:$("#LineColor").val(),
                    weight:$("#LineWidth").val(),
                    //opacity:$("#StyleOpcity").val(),
                    fillColor:$("#StyleColor").val(),
                    fillOpacity:$("#StyleOpcity").val(),
                }
            });
            lMap.map.editTools.startSector();
        });
        $("#freehandLine").unbind("click").bind("click",function(){
            //lMap.map.editTools.();
            var freehandLine = new L.Editable.freeHandPolyline(lMap.map,{
                polylineClass: L.Polyline.extend({
                    options:{
                        color:$("#LineColor").val(),
                        weight:$("#LineWidth").val(),
                        //opacity:$("#StyleOpcity").val(),
                        fillColor:$("#StyleColor").val(),
                        fillOpacity:$("#StyleOpcity").val()
                    }
                }),
                vertexMarkerClass: L.Editable.VertexMarker2,
                featuresLayer:lMap.overlayer.draw_toolbar
            });
            console.log(freehandLine);
            freehandLine.enable();
        });
        $("#freehandPolygon").unbind("click").bind("click",function(){
            //lMap.map.editTools.();
            var freehandPolygon = new L.Editable.freeHandPolygon(lMap.map,{
                polygonClass:L.Polygon.extend({
                    options:{
                        color:$("#LineColor").val(),
                        weight:$("#LineWidth").val(),
                        fillColor:$("#StyleColor").val(),
                        fillOpacity:$("#StyleOpcity").val()
                    }
                }),
               featuresLayer:lMap.overlayer.draw_toolbar
            });
            freehandPolygon.enable();
        });
        //弧线
        $("#curve").unbind("click").bind("click",function(){
            //L.marker([36.1534,120.05928]).addTo(lMap.overlayer.draw_toolbar);
            /*arc = L.arc([36.1534,120.05928],{
                startAngle: 45,
                endAngle: 180,
                radius: 900,
                strokelinecap: 'round',
                color: '#000',
                strokeWidth: 10,
                //transform: 'rotate(-270, 120, 130)'
            }).addTo(lMap.overlayer.draw_toolbar);*/
            lMap.map.editTools.options.ArcClass = L.Arc.extend({
                options:{
                    color:$("#LineColor").val(),
                    weight:$("#LineWidth").val(),
                    opacity:$("#StyleOpcity").val(),
                }
            });
            lMap.map.editTools.startArc();
        });
        //文字标注
        $("#textPt").unbind("click").bind("click",function(){
           //text = L.text([36.1534,120.05928],{size:64}).addTo(lMap.overlayer.draw_toolbar);
            var myRenderer = L.canvas({ padding: 0.5 });
            //text = L.text( [36.1534,120.05928], { renderer: myRenderer,size:64 }).addTo(lMap.overlayer.draw_toolbar);
            var iconSize= parseFloat($("#StyleSize").val())*20;
            lMap.map.editTools.options.TextClass = L.Text.extend({
                options:{
                    content:"aaaaaaa",
                    size:64
                }
            });
            lMap.map.editTools.startText();
        });
        $("#edit").unbind("click").bind("click",function(){
            lMap.overlayer.draw_toolbar.eachLayer(function(layer){
                layer.toggleEdit();
            });
        });
        //清空
        $("#clear").unbind("click").bind("click",function(){
            lMap.overlayer.draw_toolbar.clearLayers();
        });
        //导出
        $("#export").unbind("click").bind("click",function(){
            var date = new Date();
            var time = date.toISOString().substring(0,19).replace("T","_").replace(/-/g,"/");
            var geojson = JSON.stringify(lMap.overlayer.draw_toolbar.toGeoJSON());
            var jsons=[];
            lMap.overlayer.draw_toolbar.eachLayer(function(layer){
                jsons.push(getGeoJSON(layer));
            });
            funDownload(JSON.stringify( {
                type: 'FeatureCollection',
                features: jsons
            }),"图形_"+time+".json");
        });
        //导入
        $("#import").unbind("click").bind("click",function(){
            $("#importJSON").click();
        });
        document.getElementById('importJSON').onchange = function (e) {
            var val = this.value;
            var upLoadType = '.txt,.json';//['.jpg','.gif','.bmp','.png']; //可上传的格式
            var fileExt = val.substr(val.lastIndexOf(".")).toLowerCase(); //从字符串中抽出最后一次出现.之后的字符，并且转换成小写
            var result = upLoadType.indexOf(fileExt); //查找后缀名是否符合条件，如果符合返回>=0，如果不符合则返回负数;
            var oFReader = new FileReader();
            if (this.files.length === 0) { return; }
            var oFile = this.files[0]; //如果只有一个文件则只需要访问这个FileList对象中的第一个元素.
            oFReader.readAsText(oFile, "gb2312"); // 开始在后台进行读取操作。当图像文件的所有内容加载后,他们转换成一个data:URL,传递到onload回调函数中
            oFReader.onload = function (oFREvent) { //当读取操作成功完成时调用.
                var aa = oFREvent.target.result.replace("data:text/plain;base64,", "").split("?");
                console.log(oFREvent);
                var data = JSON.parse(aa[0]);
                L.geoJSON(data, {
                    style: function (feature) {
                        return feature.properties.style;
                    },
                    pointToLayer:function(geoJsonPoint, latlng) {
                        switch(geoJsonPoint.properties.type){
                            case "Text":
                                return L.text(latlng,geoJsonPoint.properties);
                                break;
                            case "Circle":
                                return L.circle(latlng,{radius:geoJsonPoint.properties.radius});
                                break;
                            case "Sector":
                                return L.semiCircle(latlng,{
                                    radius: geoJsonPoint.properties.radius,
                                    startAngle: geoJsonPoint.properties.startAngle,
                                    stopAngle: geoJsonPoint.properties.stopAngle,
                                    //renderer: L.canvas()
                                });
                                break;
                            case "Arc":
                                return L.arc(latlng,{
                                    radius: geoJsonPoint.properties.radius,
                                    startAngle: geoJsonPoint.properties.startAngle,
                                    stopAngle: geoJsonPoint.properties.stopAngle,
                                    //renderer: L.canvas()
                                });
                                break;
                            default:
                                return L.marker(latlng,{
                                    icon: L.icon(geoJsonPoint.properties.style)
                                });
                                break;
                        }
                    }
                }).addTo(lMap.overlayer.draw_toolbar);
            };
            $("#importJSON").val("");
            e.stopPropagation();
        };
    },
    //图形编辑工具
    bindEditGeoEvt:function(){
        /*lMap.overlayer.draw_toolbar.on('layeradd', function (e) {
            if(e.layer instanceof L.Path||e.layer instanceof L.Marker||e.layer instanceof L.CircleMarker|| e.layer instanceof L.Text)
            //if (e.layer instanceof L.Polygon|| e.layer instanceof L.Polyline|| e.layer instanceof L.Marker)
                e.layer.on('dblclick', L.DomEvent.stop).on('dblclick', e.layer.toggleEdit);
        });*/
        lMap.map.on('layeradd', function (e) {
            //if(lMap.overlayer.draw_toolbar.hasLayer(e.layer)) {
                //console.log("true");
                if (e.layer instanceof L.Path || e.layer instanceof L.Marker || e.layer instanceof L.CircleMarker || e.layer instanceof L.Text || e.layer instanceof L.Arc)
                //if (e.layer instanceof L.Polygon|| e.layer instanceof L.Polyline|| e.layer instanceof L.Marker)
                    e.layer.on('dblclick', L.DomEvent.stop).on('dblclick', e.layer.toggleEdit);
            //}
        });
        lMap.map.on('layerremove', function (e) {
            if (e.layer instanceof L.Polygon)
                e.layer.off('dblclick', L.DomEvent.stop).off('dblclick', e.layer.toggleEdit);
        });
        lMap.map.editTools.on('editable:enable', function (e) {
            if (this.currentPolygon)
                this.currentPolygon.disableEdit();
            this.currentPolygon = e.layer;
            this.fire('editable:enabled');
        });
        lMap.map.editTools.on('editable:disable', function (e) {
            delete this.currentPolygon;
        });
        /*lMap.map.editTools.on('editable:drawing:mouseup',function(e){
            //this.currentPolygon.bindTooltip("编辑好了",{permanent: true}).openTooltip();
//                var _tooltip = new L.Draw.Tooltip(lMap.map);
//                _tooltip.updateContent("skdkfjksdf");
        });*/
        //
    }

}
//导出文件
var funDownload = function (content, filename) {
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
};
//获取图层的JSON，包括类型和样式
function getGeoJSON(layer){
    if (layer.toGeoJSON) {
        var json = layer.toGeoJSON();
        if(json.type=="FeatureCollection"){
            //如果图层为集合
            layer.eachLayer(function(childlayer){
                getGeoJSON(childlayer);
            });
        } else if(layer._latlng) {
            //判断点、圆形、扇形
            if(layer instanceof L.Arc){
                json.properties = {
                    type: "Arc",
                    style: layer.__proto__.options,
                    radius: layer._mRadius || layer.radius,
                    startAngle: layer.options.startAngle,
                    stopAngle: layer.options.stopAngle
                };
                delete json.properties.style.renderer;
            }else if (!layer.hasOwnProperty("_mRadius")) {
                if(layer instanceof L.Text){
                    json.properties = {
                        type: "Text",
                        style: layer.__proto__.options
                    };
                }else {
                    json.properties = {
                        type: "Point",
                        style: layer.__proto__.options.icon.options
                    };
                }
            } else if (layer.options.hasOwnProperty("startAngle") || layer.options.hasOwnProperty("stopAngle")) {

                json.properties = {
                    type: "Sector",
                    style: layer.__proto__.options,
                    radius: layer._mRadius || layer.radius,
                    startAngle: layer.options.startAngle,
                    stopAngle: layer.options.stopAngle
                };
                delete json.properties.style.startAngle;
                delete json.properties.style.stopAngle;
            } else {
                json.properties = {
                    type: "Circle",
                    style: layer.__proto__.options,
                    radius: layer._mRadius
                };
            }
        }else if(layer instanceof L.Rectangle){
            json.properties = {
                type:"Rectangle",
                style: layer.__proto__.options
            };
        }else{
            json.properties = {
                type:json.geometry.type,
                style: layer.__proto__.options
            };
        }
        return json;
    }else{
        console.err("该layer没有toGeoJSON方法");
    }
}





function coordMap(x, y, R, a) {
    var ta = (360 - a) * Math.PI / 180,
        tx, ty;
    tx = R * Math.cos(ta); // 角度邻边
    ty = R * Math.sin(ta); // 角度的对边
    return {
        x: x + tx,
        y: y - ty // 注意此处是“-”号，因为我们要得到的Y是相对于（0,0）而言的。
    }
}

/**
 * 创建弧线
 * @param {*} data.startAngle 开始角度
 * @param {*} data.endAngle 结束角度
 * @param {*} data.R 圆半径
 * @param {*} data.x 中心点X坐标
 * @param {*} data.y 中心点y坐标
 * @param {*} data.color 边框颜色  默认#CCC
 * @param {*} data.strokeWidth 边框宽度 默认1
 * @param {*} data.strokelinecap 不同类型的路径的开始结束点 可选值 butt round square  默认butt
 * @param {*} data.strokeDasharray 虚线设置 它是一个<length>和<percentage>数列，数与数之间用逗号或者
 * 空白隔开，指定短划线和缺口的长度。如果提供了奇数个值，则这个值的数列重复一次，从而变成偶数个值。因此，5,3,2等同于5,3,2,5,3,2。
 * @param {*} data.transform CSS3旋转设置
 */
function drawSVG(data) {
    var path,
    // 起点坐标
        s = new coordMap(data.x, data.y, data.R, data.startAngle),
    // 结束坐标
        e = new coordMap(data.x, data.y, data.R, data.endAngle),
    // 创建弧线路径
        tpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // 画一段到(x,y)的椭圆弧. 椭圆弧的 x, y 轴半径分别为 rx,ry. 椭圆相对于 x 轴旋转 x-axis-rotation 度. large-arc=0表明弧线小于180读, large-arc=1表示弧线大于180度. sweep=0表明弧线逆时针旋转, sweep=1表明弧线顺时间旋转.
    // svg : [A | a] (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
    path = 'M' + s.x + ',' + s.y + 'A' + data.R + ',' + data.R + ',0,' + (+(data.endAngle - data.startAngle > 180)) + ',1,' + e.x + ',' + e.y;
    // 设置路径
    tpath.setAttribute('d', path);
    // 去掉填充
    tpath.setAttribute("fill", "none");
    // 设置颜色
    tpath.setAttribute('stroke', data.color || '#CCC');
    // 边线宽度
    tpath.setAttribute('stroke-width', data.strokeWidth || 1);
    data.strokelinecap ? tpath.setAttribute('stroke-linecap', data.strokelinecap) : '';
    data.strokeDasharray ? tpath.setAttribute('stroke-dasharray', data.strokeDasharray) : '';
    data.transform ? tpath.setAttribute('transform', data.transform) : '';
    return tpath;
}

/**
 * 画进度条
 * @param {*} $select  容器
 * @param {*} size 多少步 共100步
 */
function svgView(select, size) {
    var size = size,
    // 创建SVG
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("version", "1.1"); // IE9+ support SVG 1.1 version
    svg.setAttribute("width", "240px");
    svg.setAttribute("height", "240px");
    // 画底线并加入SVG中
    svg.appendChild(new drawSVG({
        startAngle: 45,
        endAngle: 315,
        x: 120,
        y: 130,
        R: 90,
        strokelinecap: 'round',
        color: '#FFF',
        strokeWidth: 10,
        transform: 'rotate(-270, 120, 130)'
    }));
    // 步长
    var step = (315 - 45) / 100,
        i = 1;
    // 画第一步并加入SVG中
    svg.appendChild(new drawSVG({
        startAngle: 45,
        endAngle: 45 + step * i,
        x: 120,
        y: 130,
        R: 90,
        strokelinecap: 'round',
        strokeWidth: 10,
        color: '#ffe400',
        transform: 'rotate(-270, 120, 130)'
    }));
    // 写入页面
    $(select).append(svg);
    // 通过设置时间循环步
    var tc = setInterval(function() {
        console.log(i, '----', 45 + step * i, '-----', 315);
        // 创建新的弧线 替换进度弧线
        svg.replaceChild(new drawSVG({
            startAngle: 45,
            endAngle: 45 + step * i,
            x: 120,
            y: 130,
            R: 90,
            strokelinecap: 'round',
            strokeWidth: 10,
            color: '#ffe400',
            transform: 'rotate(-270, 120, 130)'
        }), svg.lastChild);
        i++;
        if (i > size) {
            clearInterval(tc);
        }
    }, 20);
};
function svgView(select, endAngle) {
    var size = size,
    // 创建SVG
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("version", "1.1"); // IE9+ support SVG 1.1 version
    svg.setAttribute("width", "240px");
    svg.setAttribute("height", "240px");
    // 画底线并加入SVG中
    svg.appendChild(new drawSVG({
        startAngle: 45,
        endAngle: endAngle,
        x: 120,
        y: 130,
        R: 90,
        strokelinecap: 'round',
        color: '#000',
        strokeWidth: 10,
        transform: 'rotate(-270, 120, 130)'
    }));

    // 写入页面
    $(select).append(svg);

};







