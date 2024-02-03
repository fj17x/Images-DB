<script>
  export let url,
    title,
    description,
    id,
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
  <a class="anchor" target="_blank" href={url}>
    <img src={url} alt={title} />
  </a>

  <div class="details">
    <p class="title">{title}</p>
    {#if description}
      <p class="description">Description: {description}</p>
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
  .full-image-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  img {
    width: 100%;
    border-radius: 8px 8px 0 0;
  }

  .details {
    padding: 1.5rem;
    background-color: #172740;
    color: #fff;
    border-radius: 0 0 8px 8px;
  }

  .title {
    margin: 0;
    font-size: 1.3rem;
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
  }
  .modified-at {
    margin-top: 0rem;
    font-size: 0.8rem;
  }
  .anchor {
    text-decoration: none;
    color: #fff;
  }
</style>
