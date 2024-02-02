<script>
  import { onMount } from "svelte"
  import Dashboard from "$lib/components/Dashboard.svelte"
  import FullImageCard from "$lib/components/FullImageCard.svelte"
  import { page } from "$app/stores"

  let userName = "Unknown User"
  let image

  const fetchImageWithId = async () => {
    const response = await fetch(`http://localhost:4000/images/${$page.params.id}`, {
      method: "GET",
      credentials: "include",
    })

    const imagesReply = await response.json()
    console.log("🚀 ~ fetchImageWithId ~ imagesReply:", imagesReply)
    image = imagesReply.data
  }

  onMount(async () => {
    const response = await fetch(`http://localhost:4000/me`, {
      method: "GET",
      credentials: "include",
    })
    const reply = await response.json()
    if (response.ok) {
      userName = reply.data.userName
      userName = userName[0].toUpperCase() + userName.slice(1)
    } else {
      alert("Please sign in!")
      window.location.href = "/signin"
    }

    fetchImageWithId()
  })
</script>

<div class="container">
  <Dashboard />
  <div class="content">
    <h2>Image</h2>

    <div class="main-card">
      {#if image}
        <FullImageCard {...image} />
      {:else}
        <h1>Image not found!</h1>
      {/if}
    </div>
  </div>
</div>

<style>
  @import url("https://fonts.googleapis.com/css?family=Poppins:400,700,900");

  .container {
    display: flex;
  }

  .content {
    margin-left: 14vw;
    flex: 1;
    padding: 0px 2rem;
  }

  .main-card {
    background-color: #1ca496;
    font-family: "Poppins", sans-serif;
    font-weight: 300;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    place-items: center;
  }
</style>
