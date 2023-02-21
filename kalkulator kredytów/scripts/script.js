let obecnyPrzelicznik = 1;
let obecnaWaluta = "PLN";



function start()
{
    zmienProcenty("oprocentowanieKredytu", pobierzWartoscElementu("zmianaOprocentowaniaKredytu"));
    zmienProcenty("prowizja", pobierzWartoscElementu("zmianaProwizji"));
    zmienDate();
    document.getElementById("glownaPrzycisk").click();
}

function zmienDate()
{
    let dataZaPolRoku = new Date();
    dataZaPolRoku.setMonth(dataZaPolRoku.getMonth() + 6);

    let sformatowanyMiesiac = (dataZaPolRoku.getMonth() < 10) ? "0" + dataZaPolRoku.getMonth().toString() : dataZaPolRoku.getMonth();
    let sformatowanyDzien = (dataZaPolRoku.getDate() < 10) ? "0" + dataZaPolRoku.getDate().toString() : dataZaPolRoku.getDate();
    let sformatowanaData = dataZaPolRoku.getFullYear() + "-" + sformatowanyMiesiac + "-" + sformatowanyDzien;

    znajdzElement("dataSplaty").min = sformatowanaData;
    znajdzElement("dataSplaty").value = sformatowanaData;
}

function zmienKwote(id, oIle)
{
    oIle = parseFloat(oIle);
    let kwota = pobierzWartoscElementuFloat(id);

    kwota += oIle;
    zmienWartoscElementu(id, kwota);
    sprawdzPoprawnoscKwoty(id);
}

function sprawdzPoprawnoscKwoty(id)
{
    
    if(pobierzWartoscElementuFloat(id) <= znajdzElement(id).min)
        zmienWartoscElementu(id, znajdzElement(id).min);
}


function zmienWalute(waluta)
{
    let przelicznik = 0;

    switch(waluta)
    {
        case "pln": 
            przelicznik = 1;
            break;
        case "eur": 
            przelicznik = 4.68;
            break;
        case "usd": 
            przelicznik = 4.43;
            break;
        case "chf": 
            przelicznik = 4.73;
            break;
        case "gbp": 
            przelicznik = 5.29;
            break;
        case "jpy": 
            przelicznik = 0.034;
            break;
    }

    obecnaWaluta = waluta.toUpperCase();
    zmienWartoscElementu("wyborWalut", waluta);
    przewalutujKalkulator(przelicznik);
}

function przewalutujKalkulator(nowyPrzelicznik)
{
    przewalutujElementFormularza("rataKredytu", nowyPrzelicznik);
    przewalutujElementFormularza("kwotaDoSplaty", nowyPrzelicznik);

    obecnyPrzelicznik = nowyPrzelicznik;
}

function przewalutujElementFormularza(id, nowyPrzelicznik)
{
    let przewalutowanaKwota = przewalutuj(pobierzWartoscElementuFloat(id), nowyPrzelicznik);
    przewalutowanaKwota = przewalutowanaKwota.toFixed(2);
    zmienWartoscElementu(id, przewalutowanaKwota + " " + obecnaWaluta);
}

function przewalutuj(kwota, nowyPrzelicznik)
{

    let kwotaPLN = kwota * obecnyPrzelicznik;
    let przewalutowanaKwota = kwotaPLN / nowyPrzelicznik;

    return przewalutowanaKwota;
}

function zmienProcenty(id, procenty)
{
    zmienWartoscElementu(id, procenty + "%");
}

function przelaczBlokNadplatyKredytu(pokaz)
{
    let blokNadplatyKredytu = znajdzElement("blokNadplatyKredytu");

    if(pokaz)
    {
        blokNadplatyKredytu.style.display = "block";
    }
    else
    {
        blokNadplatyKredytu.style.display = "none";
    }
}




function oblicz()
{
    let wysokoscKredytu = pobierzWartoscElementuFloat("wysokoscKredytu");
    
    if(wysokoscKredytu == 0)
        return;

    let oprocentowanieRoczne = pobierzWartoscElementuFloat("oprocentowanieKredytu") / 100;
    let oprocentowanieMiesieczne = oprocentowanieRoczne / 12;
    let dataSplatyKredytu = new Date(pobierzWartoscElementu("dataSplaty"));
    let procentProwizji = pobierzWartoscElementuFloat("prowizja") / 100;
    
    let iloscRat = obliczIloscRat(dataSplatyKredytu);
    let prowizja = wysokoscKredytu * procentProwizji;
    wysokoscKredytu += prowizja;

    let kwotaNadplaty = (znajdzElement("nadplataKredytu").checked) ? pobierzWartoscElementuFloat("wysokoscNadplaty") : 0;
    
    if(kwotaNadplaty >= wysokoscKredytu)
        return;

    if(znajdzElement("nadplataKredytu").checked && kwotaNadplaty == 0)
        return;
    
    wysokoscKredytu -= kwotaNadplaty;
    let wysokoscRaty = 0;



    if(znajdzElement("nadplataKredytu").checked && znajdzElement("zmniejszenieOkresuSplaty").checked)
    {
        wysokoscRaty = obliczWysokoscRaty(wysokoscKredytu + kwotaNadplaty, oprocentowanieMiesieczne, iloscRat);
        iloscRat = Math.trunc(wysokoscKredytu / wysokoscRaty);               
    }
    else
    {
        wysokoscRaty = obliczWysokoscRaty(wysokoscKredytu, oprocentowanieMiesieczne, iloscRat);      
    }

    
    let kwotaDoSplaty = (iloscRat * wysokoscRaty + kwotaNadplaty).toFixed(2);
    
    zmienWalute("pln");
    wyswietlPodsumowanie(wysokoscRaty, iloscRat, kwotaDoSplaty);
}

function obliczIloscRat(dataSplaty) 
{
    let dataDzisiejsza = new Date();       

    let iloscRat = (dataSplaty.getFullYear() - dataDzisiejsza.getFullYear()) * 12;
    iloscRat -= dataDzisiejsza.getMonth();
    iloscRat += dataSplaty.getMonth();

    return iloscRat;
}

function obliczWysokoscRaty(wysokoscKredytu, oprocentowanieMiesieczne, iloscRat)
{
    if(oprocentowanieMiesieczne == 0)
    {
        return (wysokoscKredytu / iloscRat).toFixed(2);
    }

    return (wysokoscKredytu * oprocentowanieMiesieczne * Math.pow(1 + oprocentowanieMiesieczne, iloscRat) / (Math.pow(1 + oprocentowanieMiesieczne, iloscRat) - 1)).toFixed(2);
}

function wyswietlPodsumowanie(wysokoscRaty, iloscRat, kwotaDoSplaty)
{
    znajdzElement("sekcja2").style.display = "block";
    znajdzElement("sekcja2").style.animationPlayState = 'running';

    zmienWartoscElementu("rataKredytu", wysokoscRaty + " " + obecnaWaluta);
    zmienWartoscElementu("iloscRat", iloscRat);
    zmienWartoscElementu("kwotaDoSplaty", kwotaDoSplaty+ " " + obecnaWaluta);

    window.scroll({
        top: 100, 
        left: 0, 
        behavior: 'smooth'
    });
}

function znajdzElement(id)
{
    return document.getElementById(id);
}

function pobierzWartoscElementu(id)
{
    return znajdzElement(id).value;
}

function pobierzWartoscElementuFloat(id)
{
    return parseFloat(pobierzWartoscElementu(id));
}

function zmienWartoscElementu(id, nowaWartosc)
{
    znajdzElement(id).value = nowaWartosc;
}
