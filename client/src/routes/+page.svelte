<div class="hero">
  <div class="overlay"></div>
  <div class="hero-content">
    <h1>Welcome!</h1>
    <p>Explore amazing features and get started on your journey with us.</p>
    <a href="/register" class="get-started-btn">Get Started</a>
  </div>
</div>

<style>
  .hero {
    height: 90vh;
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

  .hero h1 {
    font-size: 3rem;
  }

  .hero p {
    font-size: 1.5rem;
  }

  .get-started-btn {
    display: inline-block;
    padding: 0.9375rem 1.875rem;
    font-size: 1.5rem;
    text-decoration: none;
    color: #fff;
    background-color: #e74c3c;
    border-radius: 0.5rem;
    transition:
      background-color 0.3s ease-in-out,
      transform 0.3s ease-in-out;
  }

  .get-started-btn:hover {
    background-color: #c0392b;
    transform: scale(1.05);
  }
</style>
