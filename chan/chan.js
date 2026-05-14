// hide/unhide posts
function checkbox_callback(e){
    let replydiv = e.target.parentElement.parentElement.querySelector(".reply_content");
    if (e.target.checked){
        replydiv.style.display = "none"
    } else {
        replydiv.style.display = ""
    }
}

// function to add a reply.
function makeReply(body, datetime, sizeRatio, postid){
    let section = document.createElement('div')
    section.classList.add('section');
    let arrows = document.createElement('div');
    arrows.classList.add('sideArrows');
    arrows.innerHTML = "&gt;&gt;"
    section.appendChild(arrows);
    let reply = document.createElement('div');
    reply.classList.add('reply');
    let name = document.createElement('span');
    name.classList.add('anon');
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.onchange = checkbox_callback;
    let anonname = document.createElement("span")
    anonname.innerText = "Anonomyous"
    name.appendChild(checkbox)
    name.appendChild(anonname)
    reply.appendChild(name)
    let dateposted = document.createElement('span');
    dateposted.innerText = " Posted " + datetime + " No." + postid;
    reply.appendChild(dateposted)
    let fakeMenu = document.createElement('span');
    fakeMenu.classList.add('fakemenu');
    fakeMenu.innerHTML = "&#9654;";
    reply.appendChild(fakeMenu);
    let replyContent = document.createElement('span')
    replyContent.classList.add('reply_content');
    let fakeImg = document.createElement('div');
    fakeImg.classList.add("fakeimg");
    random_bg(fakeImg);
    let imgw = 125 * sizeRatio;
    let imgh = 125;
    fakeImg.style.height = imgh;
    fakeImg.style.width = imgw;
    
    replyContent.appendChild(fakeImg);
    let quotelink = document.createElement('div');
    quotelink.classList.add("quotelink");
    quotelink.innerText = ">>" + (postid-1);
    replyContent.appendChild(quotelink)
    // split paragraphs.
    let body_split = body.split("\n");
    for (b of body_split){
        b = b.trim();
        let txt = document.createElement('p');
        txt.innerText = b;
        replyContent.appendChild(txt);
    }
    reply.appendChild(replyContent);
    section.appendChild(reply);
    return section;
}



function random_bg(img_obj){
    let palettes = [
        ['#462255', "#313B72", "#62A87C", "#7EE081", "#C3F3C0"],
        ['#00487C', "#4BB3FD", "#3E6680", "#0496FF", "#027BCE"],
        ['#F2F3AE', "#EDD382", "#FC9E4F", "#FF521B", "#020122"]
    ];
    shuffle(palettes)
    let colors = palettes[0];
    shuffle(colors);
    let color_1 = colors[0];
    let color_2 = colors[1];
    let patterns = ["solid", "lin_up", "lin_left", "diamonds", "lin_diag", "radial2", "radial3"]
    shuffle(patterns) // assume imported;
    let pattern = patterns[0];
    if (pattern == "solid"){
        img_obj.style.background = color_1;
    } else if (pattern === 'diamonds') {
        let sizes = [10, 25, 40, 60];
        shuffle(sizes)
        let size = sizes[0];
        img_obj.style.backgroundColor = color_1;
        img_obj.style.backgroundImage = `
            linear-gradient(45deg,
                ${color_2} 25%,
                transparent 25%,
                transparent 75%,
                ${color_2} 75%,
                ${color_2}
            ),
            linear-gradient(-45deg,
                ${color_2} 25%,
                transparent 25%,
                transparent 75%,
                ${color_2} 75%,
                ${color_2}
            )
        `;
        img_obj.style.backgroundSize = `${size}px ${size}px`;
        img_obj.style.backgroundPosition = `0 0, ${size/2}px ${size/2}px`;
    } else if (pattern == "lin_up"){
        img_obj.style.background = `linear-gradient(to bottom, ${color_1}, ${color_2})`
    } else if (pattern == "lin_left"){
        img_obj.style.background = `linear-gradient(to left, ${color_1}, ${color_2})`
    } else if (pattern == "lin_diag"){
        img_obj.style.background = `linear-gradient(to bottom left, ${color_1}, ${color_2})`
    } else if (pattern == "radial2"){
        img_obj.style.background = `radial-gradient(circle, ${color_1}, ${color_2})`
    } else if (pattern == "radial3"){
        let color_3 = colors[2];
        img_obj.style.background = `radial-gradient(circle, ${color_1}, ${color_2}, ${color_3})`
    }
}

function chanDateFormat(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const yy = String(date.getFullYear()).slice(-2);
  const day = days[date.getDay()];
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  return `${mm}/${dd}/${yy}(${day})${hh}:${min}:${ss}`;
}

function getGutenbergId(input) {
  if (!input) return null;

  // If it's already a number or numeric string
  if (/^\d+$/.test(input)) return Number(input);

  // Try to extract ID from URL
  const match = input.match(/gutenberg\.org\/(?:ebooks|files|cache\/epub)\/(\d+)/i);

  return match ? Number(match[1]) : null;
}

// get books and try to load some
async function chan_reader(){
    // enter on id box triggers load
    document.getElementById("book_id").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("url_brn").click();
    }
    });
    // btn triggers load
    document.getElementById("url_brn").addEventListener("click", function(event){
        let box = document.getElementById("book_id").value
        let book_id = getGutenbergId(box)
        if (book_id == null){
            window.alert("could not understand")
        } else {
        const paramsString = window.location.search;
        const searchParams = new URLSearchParams(paramsString);
        // is it a url? or an id? get the id?
        searchParams.set("bookid", book_id)
        window.location.search = "?" + searchParams.toString()
        }
    })


    const cutoffs = [0, 50, 100, 100, 200, 200, 500, 1000]
    let title_elem = document.getElementById("title");
    let info_elem = document.getElementById("info");
    //load_runner("../books/");
    // micro should simply ugly-render a book at random!
    let key;
    let keys = await get_book_keys().catch(()=>[])
    const paramsString = window.location.search;
    const searchParams = new URLSearchParams(paramsString);
    if (searchParams.has("bookid")){
        key = parseInt(searchParams.get("bookid"), 10);
    } else {
        // random number of some range
        key = shuffle(_POPULAR_IDS)[0]
        searchParams.set("bookid", key)
        window.location.search = "?" + searchParams.toString()
    }
    console.log(keys)
    console.log(key)
    if (keys.indexOf(key)>=0){
        console.log("already cached?")
    } else {
        await load_book(key)
    }
    let book_doc = await idb_get_item(key);
    
    console.log(book_doc);
    //alert("Have fun reading: " + book_doc['book_title'])

    title_elem.innerText = book_doc['book_title'];

    let starting_no = book_doc['etextno'];
    
    // author name split
    let author_name = book_doc['author']
    if (author_name == null){
        author_name = "UNKNOWN"
    }
    author_name = author_name.trim();
    if (author_name.indexOf(',') >= 0){
        let author_split = author_name.split(",")
        let last_name = author_split[0].trim();
        let other_names = author_split.join(",").trim();
        author_name = other_names + " " + last_name
    }
    // assemble info string
    let byline = "[by: " + author_name +"]";
    info_elem.innerText = byline;

    let starting_date = new Date(book_doc['issued']);
    // set hours and minutes
    starting_date.setHours(Math.floor(Math.random()*22))
    starting_date.setMinutes(Math.floor(Math.random()*57))
    starting_date.setSeconds(Math.floor(Math.random()*58))
    let reply_date = starting_date;

    // ok text formatting. lazy for now
    let txt = book_doc['text']
    txt = txt.replace(/\r/g, '')
    txt = txt.replace(/\n\n/g, '<hr />');
    txt = txt.replace(/\n/g, ' ');
    let replies = document.getElementById('replies');
    replies.innerHTML = ""; // clear
    let posts = txt.split("<hr />")
    let buffer = ""
    let cutoff = 200;
    for (let p of posts){
        p = p.trim();
        //console.log("lengths:", p.length, buffer.length, cutoff)
        if ((p+buffer).length > 0 && (p + buffer).length > cutoff ){
            // new cutoff 
            cutoff = cutoffs[Math.floor(Math.random() * 8)];
            if (cutoff == undefined){
                cutoff = 200; // fallback just in case
            }
            let post = makeReply(p + buffer, chanDateFormat(reply_date), 1 - (0.3*Math.random()), starting_no)
            reply_date.setSeconds(reply_date.getSeconds() + (p + buffer).length);
            starting_no += 1;
            buffer = "";
            replies.appendChild(post);
        } else if (p.length > 0){
            buffer += " "
            buffer += p + "\n";
        }
    }
    // post residual buffer
    buffer = buffer.trim();
    if (buffer.length > 0){
        let post = makeReply(buffer, chanDateFormat(reply_date), 1 - (0.3*Math.random()))
        replies.appendChild(post);
        buffer = "";
    }
}

document.addEventListener('DOMContentLoaded', chan_reader, false);