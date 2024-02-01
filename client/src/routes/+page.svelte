<div class="hero">
  <div class="overlay"></div>
  <div class="hero-content">
    <h1><span class="title-light">Images</span><span class="title-strong">DB</span></h1>
    <p class="text">Share your life's snapshots.</p>
    <a href="/register" class="get-started-btn">Create an account</a>
    <a href="/signin" class="have-account"> Already have an account?</a>
  </div>
</div>

<style>
  .hero {
    height: 100vh;
    position: relative;
    text-align: center;
    color: #fff;
    background: url("/background.jpg") center/cover no-repeat;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
  }

  .hero-content {
    position: relative;
    z-index: 1;
  }

  .title-light {
    font-weight: lighter;
  }
  .title-strong {
    font-weight: bold;
  }

  .hero h1 {
    font-size: 4.5rem;
    margin: 0px auto;
  }

  .text {
    font-size: 1.8rem;
    margin-top: 0px;
    margin-bottom: 3.4rem;
    font-family: cursive;
    letter-spacing: -2px;
    /* font-weight: lighter; */
  }

  .get-started-btn {
    display: inline-block;
    padding: 1rem 1.8rem;
    font-size: 1.5rem;
    text-decoration: none;
    color: #fff;
    background-color: #1baa9e;
    border-radius: 0.5rem;
    transition:
      background-color 0.3s ease-in-out,
      transform 0.3s ease-in-out;
  }

  .get-started-btn:hover {
    background-color: #1dcfc0;
    transform: scale(1.05);
  }

  .have-account {
    text-decoration: none;
    display: block;
    margin-top: 0.5rem;
    color: white;
    font-size: 0.9rem;
    font-weight: lighter;
  }
</style>
