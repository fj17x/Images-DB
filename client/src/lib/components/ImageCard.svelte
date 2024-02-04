<script>
  export let url, title, id, destroyTime
</script>

<div class="card">
  <a href="/dashboard/myimages/{id}" class="anchor">
    <img src={url} alt={title} />
    <p class="title {destroyTime ? 'destroyed' : 'normal'}">{title}</p>
  </a>
</div>

<style>
  .card {
    border-radius: 8px;
    overflow: hidden;
    width: 300px;
  }
  .destroyed {
    color: red;
  }

  .normal {
    color: black;
  }

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 0.5rem;
  }

  .title {
    margin-top: 0.4rem;
  }

  .anchor {
    text-decoration: none;
    color: #fff;
  }
</style>
