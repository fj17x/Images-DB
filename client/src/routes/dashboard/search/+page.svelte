<script>
  import Sidebar from "$lib/components/Sidebar.svelte"
  import ImageModal from "$lib/components/ImageModal.svelte"
  import ImagesModal from "$lib/components/ImagesModal.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"

  let tags = []
  let showSimpleModal = false
  let showAdvancedModal = false

  let showAlertModal = false
  let alertModalOptions = {}
  let imageData = {}
  let images = []

  let toAddTag

  let idForSimple
  let limit = 10
  let offset = 0
  let sortOrder
  let sortBy

  const addTag = () => {
    const tagValue = toAddTag.trim()

    if (tagValue) {
      if (!tags.includes(tagValue)) {
        tags = [...tags, tagValue]
        toAddTag = ""
      } else {
        alertModalOptions.header = "Could not add tag"
        alertModalOptions.message = "Tag already exists!"
        alertModalOptions.type = "failure"
        showAlertModal = true
      }
    } else {
      alertModalOptions.header = "Could not add tag"
      alertModalOptions.message = "Please enter a tag!"
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }

  const removeTag = (toRemoveTag) => {
    tags = tags.filter((tag) => tag !== toRemoveTag)
  }

  const handleSearchSingle = async () => {
    const searchId = idForSimple
    const response = await fetch(`http://localhost:4000/images/${searchId}`, {
      method: "GET",
      credentials: "include",
    })
    const reply = await response.json()
    if (response.ok) {
      imageData = {
        url: reply.data.url,
        title: reply.data.title,
        id: reply.data.id,
      }
      showSimpleModal = true
    } else {
      alertModalOptions.header = "Search failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }

  const handleSearchAdvanced = async () => {
    const params = new URLSearchParams()
    params.append("limit", limit)
    params.append("offset", offset)
    params.append("sortOrder", sortOrder)
    params.append("sortBy", sortBy)

    if (tags.length > 0) {
      const tagsWithCommas = tags.join(",")
      params.append("tags", tagsWithCommas)
    }

    const response = await fetch(`http://localhost:4000/images?${params.toString()}`, {
      method: "GET",

      credentials: "include",
    })
    const reply = await response.json()
    if (response.ok) {
      images = reply.data
      showAdvancedModal = true
    } else {
      alertModalOptions.header = "Search failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }
</script>

<div class="container-fluid p-0 m-0">
  <Sidebar />
  <div class="contents">
    <div class="content">
      <h3>Search for an image using ID:</h3>

      <div class="main-card">
        <form class="card-form" on:submit|preventDefault={handleSearchSingle}>
          <span class="input-normal">
            <span>
              <label for="id">Image ID*:</label>
              <!-- svelte-ignore a11y-autofocus -->
              <input autofocus type="number" name="id" bind:value={idForSimple} required />
            </span>
            <button class="confirm-button" type="submit">Search</button>
          </span>
        </form>
      </div>
    </div>
    <div class="content">
      <h3>Advanced search:</h3>
      <div class="main-card">
        <form on:submit|preventDefault={handleSearchAdvanced}>
          <div class="grid">
            <div class="grid-item">
              <label for="limit">Limit:</label>
              <br />
              <input type="number" name="limit" bind:value={limit} required />
            </div>
            <div class="grid-item xx">
              <label for="sortby">Sort By:</label>
              <br />
              <select name="sortby" id="sortby" bind:value={sortBy}>
                <option value="id">id</option>
                <option value="url">url</option>
                <option value="description">description</option>
                <option value="createdAt">createdAt</option>
                <option value="updatedAt">updatedAt</option>
              </select>
            </div>
            <div class="grid-item">
              <label for="offset">Offset:</label>
              <br />
              <input type="number" name="offset" bind:value={offset} required />
            </div>
            <div class="grid-item">
              <label for="sortorder">Sort Order:</label>
              <br />
              <select name="sortorder" id="sortorder" bind:value={sortOrder}>
                <option value="ASC">ASC</option>
                <option value="DESC">DESC</option>
              </select>
            </div>
            <div class="grid-item">
              <label for="tag">Tags:</label>
              <br />

              <div class="tag-input">
                <p class="left"></p>
                <input type="text" name="tag" id="tag" bind:value={toAddTag} />
                <p class="right"></p>
                <button type="button" class="submit-button" on:click={addTag}>Add</button>
              </div>
              <br />
              {#each tags as tag}
                <span class="tag-container">
                  <button type="button" class="tag-toggle" on:click={() => removeTag(tag)}>
                    {tag}
                    <span class="remove-tag">
                      <i class="fa fa-times"></i>
                    </span>
                  </button>
                  &nbsp;
                </span>
              {/each}
              <br />
              <br />
            </div>
            <div class="grid-item">
              <button class="confirm-button" type="submit">Search</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

{#if showSimpleModal}
  <ImageModal bind:showModal={showSimpleModal} {...imageData}></ImageModal>
{/if}
{#if showAdvancedModal}
  <ImagesModal bind:showModal={showAdvancedModal} {images}></ImagesModal>
{/if}
{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
{/if}

<style>
  .tag-toggle {
    background-color: rgb(207, 59, 59);
    border-radius: 10px;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  #sortby,
  #sortorder {
    width: 10rem;
    padding: 0.1rem;
    font-size: 1rem;
    border: 1px solid #999;
    border-radius: 0.5rem;
    cursor: pointer;
    background-color: #f5f5f5;
    color: #333;
  }

  .container {
    display: flex;
  }

  .content {
    flex: 1;
    padding: 0px 2rem;
    margin-left: 14vw;
    width: 75vw;
  }

  .contents {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .input-normal {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  .main-card {
    background-color: #1ca496;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    padding: 2rem 2rem 1rem 2rem;
  }

  .card-form {
    display: flex;
    justify-content: center;
    align-items: space-between;
    flex-direction: column;
    color: white;
    padding: 0 2.5rem;
  }

  .grid {
    display: grid;
    color: white;
    grid-template-columns: repeat(2, 1fr);
    place-items: center;
    text-align: center;
  }

  .grid-item {
    margin-bottom: 1rem;
    width: 100%;
  }

  .input-normal input {
    width: 50%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
  }

  .grid-item > input {
    width: 50%;
    padding: 0;
    border: 0;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
  }

  .tag-input {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    width: 100%;
    padding: 0;
  }
  .tag-input > input {
    width: 30%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.3rem;
  }
  .tag-input > .right {
    min-width: 3%;
  }
  .tag-input > .left {
    max-width: 10%;
  }

  .submit-button {
    background-color: #172740;
    border-radius: 0.3rem;
    color: #fff;
    cursor: pointer;
    border: none;
    padding: 0.5rem 1rem;
    width: 25%;
  }

  .submit-button:hover {
    transform: scale(1.05);
  }
  .confirm-button {
    font-size: 1.2rem;
    background-color: #309329;
    border-radius: 0.3rem;
    color: #fff;
    cursor: pointer;
    border: none;
    padding: 0.5rem 1rem;
  }

  .confirm-button:hover {
    transform: scale(1.05);
  }

  @media screen and (max-width: 800px) {
    .submit-button {
      padding: 0rem;
    }
  }
</style>
