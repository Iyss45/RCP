function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const yourModule = {
  async fetch(request, env) {
    let url = new URL(request.url);

    let urlsStr = url.pathname.startsWith('/proxy/') ? url.pathname.replace("/proxy/","") : url.pathname.replace("/tproxy/","")
    let urls = urlsStr.split(',');

    shuffleArray(urls);

    const domain = url.searchParams.get('domain');

    if (url.pathname.startsWith('/proxy/') || url.pathname.startsWith('/tproxy/')) {
      for(let actualUrlStr of urls){
        let actualUrl = new URL(actualUrlStr);

        let modifiedRequest = new Request(actualUrl, {
          headers: request.headers,
          method: request.method,
          body: request.body,
          redirect: 'follow'
        });

        if (domain) {
          modifiedRequest.headers.set('domain', domain);
        }
     
        try {
          const response = await fetch(modifiedRequest);
          const modifiedResponse = new Response(response.body, response);
          modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
          modifiedResponse.headers.set('actualUrl', actualUrlStr);
          return modifiedResponse;

        } catch (error) {
          console.error(error.message);
          continue;
        }
      } 
    }
    
    return new Response('All URLs failed', { status: 500 });
  },
};

function searchAndFetch() {
  const urlInput = document.getElementById('urlInput').value;
  
  if (urlInput.trim() !== '') {
    const request = new Request(`/proxy/${urlInput}`, {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json',
        // Add other headers if needed
      }),
    });

    const environment = {}; // You can define environment if required

    // Call your existing fetch function
    yourModule.fetch(request, environment).then(response => {
      // Handle the response as needed
      console.log(response);
    }).catch(error => {
      console.error(error);
    });
  } else {
    alert('Please enter a valid URL');
  }
}
