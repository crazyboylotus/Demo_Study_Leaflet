/**
 * Created by 世莲 on 2018/4/17.
 */
//根据首点坐标、距离和方位角计算终点坐标和角度
function getEndPt (Jd, Wd, Dis, Angle) {
    // [JJ,WW,Ang21]=disjw(Jd,Wd,Dis,Angle)
    // 此函数已知两点间距Dis(以米为单位)、与正北夹角Angle（以°为单位）和一点的经纬度（Jd，Wd），
    // 计算另一点的经纬度（JJ，WW）
    var e = 2.718282;
    var re = 6371000;
    var a = 6378245;
    var e2 = 0.0067385241;
    var jd = Jd * Math.PI / 180.0;
    var wd = Wd * Math.PI / 180.0;
    var angle = Angle * Math.PI / 180.0;
    var A = Math.sqrt(1 + e2 * Math.pow(Math.cos(wd), 4));
    var B = Math.sqrt(1 + e2 * Math.pow(Math.cos(wd), 2));
    var C = Math.sqrt(1 + e2);
    var cgm = Dis * Math.pow(B, 2) / (a * C);
    var temp_x = B * Math.cos(wd) - Math.tan(cgm) * Math.sin(wd) * Math.cos(angle);
    var jj = jd + (1 / A) * Math.atan(A * Math.tan(cgm) * Math.sin(angle) / temp_x);
    var W = A * (jj - jd) / 2;
    var x = Math.cos(angle);
    var y = (1 / A) * Math.sin(wd) * Math.sin(angle) * Math.tan(W);
    var z = Math.sin(cgm) * (x - y);
    var D = 0.5 * Math.asin(z);
    var ww = wd + 2 * D * (B - (3.0 / 2.0) * e2 * D * Math.sin(2 * wd + (4.0 / 3.0) * B * D));
    var E = Math.cos(cgm) * (Math.tan(cgm) * Math.tan(wd) - B * Math.cos(angle));
    var F = -B * Math.sin(angle);
    var ang21 = Math.atan2(F, E);
    if (ang21 < 0)
        ang21 = ang21 + 2 * Math.PI;
    var JJ = jj * 180 / Math.PI;
    var WW = ww * 180 / Math.PI;
    var Ang21 = ang21 * 180 / Math.PI;
    var pt = {
        lon: JJ,
        lat: WW,
        angle: Ang21
    }
    return pt;
};
//计算方位角，以点一为中心
function getBearing(lng1,lat1,lng2,lat2){
    lat1 = parseFloat(lat1);
    lng1 = parseFloat(lng1);
    lat2 = parseFloat(lat2);
    lng2 = parseFloat(lng2);
    var averageLat = (lat1 + lat2) / 2;
    var azimuth;
    if (lat1 - lat2 == 0) {
        if (lng1 > lng2)
            azimuth = -90;
        else
            azimuth = 90;
    }
    else {
        azimuth = Math.atan((lng1 - lng2) * Math.cos(angToRad(averageLat)) / (lat1 - lat2)) * 180 / Math.PI;
    }
    if (lat1 > lat2) {
        azimuth = azimuth + 180;
    }
    if (azimuth < 0) {
        azimuth = 360 + azimuth;
    }
    return azimuth;
}
//度数转弧度
function angToRad(angle_d) {
    var Pi = 3.1415926535898;
    var rad1;
    rad1 = angle_d * Pi / 180;
    return rad1;
}
//判断一个点是否在复杂多边形的内部
function ptIsInPolygon(checkPoint, polygonPoints) {
    var counter = 0;
    var i;
    var xinters;
    var p1, p2;
    var pointCount = polygonPoints.length;
    p1 = polygonPoints[0];

    for (i = 1; i <= pointCount; i++) {
        p2 = polygonPoints[i % pointCount];
        if (
            checkPoint[0] > Math.min(p1[0], p2[0]) &&
            checkPoint[0] <= Math.max(p1[0], p2[0])
        ) {
            if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
                if (p1[0] != p2[0]) {
                    xinters =
                        (checkPoint[0] - p1[0]) *
                        (p2[1] - p1[1]) /
                        (p2[0] - p1[0]) +
                        p1[1];
                    if (p1[1] == p2[1] || checkPoint[1] <= xinters) {
                        counter++;
                    }
                }
            }
        }
        p1 = p2;
    }
    if (counter % 2 == 0) {
        return false;
    } else {
        return true;
    }
}
//判断一个复杂多边形是否在一个复杂多边形的内部
function polygonIsInPolygon(checkpolygonPoints,polygonPoints){
    for(var i=0;i<checkpolygonPoints.length;i++){
        if(!ptIsInPolygon(checkpolygonPoints[i],polygonPoints))
            return false;
    }
    return true;
}
//判断一个多边形是否是凸多边形
function isConvex(latlngs){
    /*for(var i=1;i<latlngs.length-1;i++){
        var angleForward = getBearing(latlngs[i].lng,latlngs[i].lat,latlngs[i-1].lng,latlngs[i-1].lat);
        var angleBehind = getBearing(latlngs[i].lng,latlngs[i].lat,latlngs[i+1].lng,latlngs[i+1].lat);
        angleForward = angleForward > 0 ? angleForward : (360+angleForward);
        angleBehind = angleBehind > 0 ? angleBehind : (360+angleBehind);
        if((angleBehind-angleForward>180)||(angleBehind-angleForward<0&&(angleBehind-angleForward+360>180)))
            return false;
    }*/
    return true;
}

