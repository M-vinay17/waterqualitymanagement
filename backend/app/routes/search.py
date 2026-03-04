from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.search import Search
from app.schemas.search import SearchCreate, SearchResponse

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


@router.post("/", response_model=SearchResponse)
def save_search(search: SearchCreate, db: Session = Depends(get_db)):

    new_search = Search(**search.model_dump())

    db.add(new_search)
    db.commit()
    db.refresh(new_search)

    return new_search


@router.get("/{user_id}", response_model=list[SearchResponse])
def get_user_searches(user_id: int, db: Session = Depends(get_db)):

    searches = db.query(Search).filter(
        Search.user_id == user_id
    ).all()

    return searches