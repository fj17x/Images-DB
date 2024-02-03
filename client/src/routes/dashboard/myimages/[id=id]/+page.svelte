<script>
  import { onMount } from "svelte"
  import Dashboard from "$lib/components/Dashboard.svelte"
  import FullImageCard from "$lib/components/FullImageCard.svelte"
  import EditImageModal from "$lib/components/EditImageModal.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { page } from "$app/stores"

  let showAlertModal = false
  let alertModalOptions = {}

  let image
  let showEditImageModal = false
  let loading = true

  const fetchImageWithId = async () => {
    const response = await fetch(`http://localhost:4000/images/${$page.params.id}`, {
      method: "GET",
      credentials: "include",
    })

    const imagesReply = await response.json()
    image = imagesReply.data
    loading = false
  }

  const onEditConfirm = async (status, data) => {
    if (!status) {
      showEditImageModal = false
      return
    }
    if (data) {
      Object.keys(data).forEach((key) => (data[key] === undefined ? delete data[key] : {}))
    }

    showEditImageModal = false

    const response = await fetch(`http://localhost:4000/images/${$page.params.id}`, {
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const reply = await response.json()
    if (response.ok) {
      alertModalOptions.header = "Successfully updated"
      alertModalOptions.message = reply.message
      alertModalOptions.type = "success"
      showAlertModal = true
      await fetchImageWithId()
    } else {
      alertModalOptions.header = "Could not update"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }

  onMount(async () => {
    await fetchImageWithId()
  })
</script>

<div class="container">
  <Dashboard />
  <div class="content">
    {#if loading}
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    {:else}
      <div class="main-card">
        {#if image}
          <div class="header">
            <h3>Image ID: {image.id}</h3>
            <button class="edit-button" on:click={() => (showEditImageModal = true)}>Edit</button>
          </div>
          <FullImageCard
            title={image.title}
            description={image.description}
            tags={image.tags}
            url={image.url}
            createdAt={image.createdAt}
            modifiedAt={image.modifiedAt}
            id={image.id}
          />
        {:else}
          <h1>Image not found!</h1>
        {/if}
      </div>
    {/if}
  </div>
</div>

{#if showEditImageModal}
  <EditImageModal
    bind:showModal={showEditImageModal}
    oldTitle={image.title}
    oldDescription={image.description}
    oldTags={image.tags}
    oldUrl={image.url}
    {onEditConfirm}
  ></EditImageModal>
{/if}

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
{/if}

<style>
  @import url("https://fonts.googleapis.com/css?family=Poppins:400,700,900");

  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  }

  .edit-button {
    background-color: #e01f32;
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

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
  }
</style>
