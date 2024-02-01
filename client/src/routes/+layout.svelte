<script>
  import "@fortawesome/fontawesome-free/css/all.min.css"
</script>

<!-- 
<nav class="navbar">
  <a href="/" class="logo-link">
    <img src="/logo.png" alt="Logo" class="logo-img" />
    <div class="logo-text">
      <p>Images DB Project</p>
    </div>
  </a>
  <div class="menu-icon">&#9776;</div>
  <ul class="nav-links">
    <li><a href="/register">Register</a></li>
    <li><a href="/signin">Sign In</a></li>
  </ul>
</nav> -->

<slot />

<style>
  :root {
    font:
      1.2em "Fira Sans",
      sans-serif;
    overflow: hidden;
  }

  * {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
  }

  .navbar {
    height: 10vh;
    background-color: #333;
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo-link {
    text-decoration: none;
    color: #fff;
    font-weight: bold;
    display: flex;
    align-items: center;
    font-size: 1.4rem;
  }

  .logo-img {
    width: 2.8rem;
    height: auto;
    display: block;
    margin-right: 2rem;
    margin-left: 3rem;
  }

  .logo-text {
    white-space: nowrap;
    font-weight: bold;
  }

  .nav-links {
    list-style: none;
    display: flex;
  }

  .nav-links li {
    margin-right: 2rem;
  }

  .nav-links a {
    text-decoration: none;
    color: white;
    font-weight: bold;
  }

  .nav-links a:hover {
    color: #ffc107;
  }

  .menu-icon {
    font-size: 2rem;
    cursor: pointer;
    display: none;
  }

  @media only screen and (max-width: 768px) {
    .nav-links {
      display: none;
    }

    .menu-icon {
      display: block;
    }

    .navbar.active .nav-links {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 70px;
      left: 0;
      background-color: #333;
      width: 100%;
      z-index: 1;
    }

    .navbar.active .nav-links li {
      margin-right: 0;
      text-align: center;
      padding: 1rem;
    }

    .navbar.active .nav-links a {
      font-size: 1.2rem;
    }
  }
</style>
