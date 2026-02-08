// get books and try to load some
async function micro_reader(){
let title_elem = document.getElementById("title");
    let info_elem = document.getElementById("info");
    let text_elem = document.getElementById("text");
    load_runner();
    // micro should simply ugly-render a book at random!
    let keys = await get_book_keys();
    // if we have no books, wait a second and try again, up to 5 times. then give up.
    let tries = 0;
    while (keys.length == 0 && tries < 5){
        await new Promise(r => setTimeout(r, 1000));
        keys = await get_book_keys();
        tries ++;
    } 
    // give up cry :(
    if (keys.length == 0){
        text_elem.innerHTML = "<h1> Oh no it failed </h1> <p> sorry... </p>";
    }
    console.log(keys)
    shuffle(keys);
    console.log(keys)
    key = keys[0];
    console.log(key)
    let book_doc = await idb_get_item(key);
    console.log(book_doc);
    //alert("Have fun reading: " + book_doc['book_title'])

    title_elem.innerText = book_doc['book_title'];
    
    // author name split
    let author_name = book_doc['author'].trim();
    if (author_name.indexOf(',') >= 0){
        let author_split = author_name.split(",")
        let last_name = author_split[0].trim();
        let other_names = author_split.join(",").trim();
        author_name = other_names + " " + last_name
    }
    // assemble info string
    let byline = "by: " + author_name + " | book ID: " + book_doc['etextno'] + " | " + "issued: " + book_doc['issued'] + " |"
    info_elem.innerText = byline;

    // ok text formatting. lazy for now
    let txt = book_doc['text']
    txt = txt.replace(/\n\n/g, '<hr />');
    txt = txt.replace(/\n/g, '<br />');
    text_elem.innerHTML = txt;
}

document.addEventListener('DOMContentLoaded', micro_reader, false);