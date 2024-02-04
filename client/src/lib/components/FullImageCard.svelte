<script>
  export let url,
    title,
    description,
    id,
    destroyTime,
    tags = [],
    createdAt,
    updatedAt

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    const formattedDate = new Date(dateString).toLocaleDateString("en-US", options)
    return formattedDate
  }

  console.log(tags)
</script>

<div class="full-image-card">
  <div class="image-box">
    <a class="anchor" target="_blank" href={url}>
      <img src={url} alt={title} />
    </a>
  </div>
  <div class="details">
    <h1 class="title {destroyTime ? 'destroyed' : ''}">{title} {destroyTime ? "This image was deleted" : ""}</h1>
    <hr />
    {#if description}
      <p class="description">Description: {description}</p>
      <hr />
    {/if}

    <div class="tags">
      <span>Tags:&nbsp;</span>
      {#if tags.length > 0}
        {#each tags as tag}
          <span class="tag">{tag}&nbsp;</span>
        {/each}
      {:else}
        <p>No tags found.</p>
      {/if}
    </div>

    <p class="created-at">Created on: {formatDate(createdAt)}</p>
    {#if updatedAt}
      {#if updatedAt !== createdAt}
        <p class="modified-at">Last modified on : {formatDate(updatedAt)}</p>
      {/if}
    {/if}
  </div>
</div>

<style>
  .destroyed {
    color: red;
  }
  .full-image-card {
    border-radius: 8px;
    overflow: hidden;
  }

  .image-box {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 2rem;
  }

  img {
    max-width: 100%;
    min-height: 400px;
    max-height: 600px;
    border-radius: 8px 8px 0 0;
  }

  .details {
    padding: 1.5rem;
    background-color: #172740;
    color: #fff;
    border-radius: 50px;
  }

  .title {
    margin: 0;
    font-weight: bold;
  }

  .description {
    margin-top: 0.5rem;
    font-size: 1rem;
  }

  .tags {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .tag {
    background-color: #1ca496;
    color: #fff;
    border-radius: 4px;
    padding: 0.2rem 0.5rem;
    margin-right: 0.5rem;
    font-size: 0.8rem;
  }

  .created-at {
    margin-top: 0.5rem;
    margin-bottom: 0.1rem;
    font-size: 0.8rem;
    direction: rtl;
  }
  .modified-at {
    margin-top: 0rem;
    font-size: 0.8rem;
    direction: rtl;
  }
  .anchor {
    text-decoration: none;
    color: #fff;
  }
</style>
